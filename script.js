
// ==========================================
// EliEats JavaScript
// Restaurant Search, Filters, and Reviews
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ======================================
    // 1. RESTAURANT SEARCH AND FILTERS
    // ======================================

    const searchInput = document.getElementById("searchInput");
    const dietFilter = document.getElementById("dietFilter");
    const accessFilter = document.getElementById("accessFilter");
    const clearFilters = document.getElementById("clearFilters");

    const restaurantCards =
        document.querySelectorAll(".restaurant-card");

    const noResults = document.getElementById("noResults");
    const resultsCount = document.getElementById("resultsCount");

    function filterRestaurants() {

        const searchText =
            searchInput ? searchInput.value.trim().toLowerCase() : "";

        const selectedDiet =
            dietFilter ? dietFilter.value : "all";

        const selectedAccess =
            accessFilter ? accessFilter.value : "all";

        let visibleCount = 0;

        restaurantCards.forEach(function (card) {

            const restaurantText = card.textContent.toLowerCase();

            const diets = (card.dataset.diet || "").split(/\s+/);
            const accessibility =
                (card.dataset.access || "").split(/\s+/);

            const matchesSearch =
                restaurantText.includes(searchText);

            const matchesDiet =
                selectedDiet === "all" ||
                diets.includes(selectedDiet);

            const matchesAccess =
                selectedAccess === "all" ||
                accessibility.includes(selectedAccess);

            const matchesAll =
                matchesSearch && matchesDiet && matchesAccess;

            card.hidden = !matchesAll;

            if (matchesAll) {
                visibleCount++;
            }

        });

        if (noResults) {
            noResults.hidden = visibleCount !== 0;
        }

        if (resultsCount) {
            resultsCount.textContent =
                `Showing ${visibleCount} of ${restaurantCards.length} restaurants`;
        }
    }

    // Search as the user types
    if (searchInput) {
        searchInput.addEventListener("input", filterRestaurants);
    }

    // Dietary filter
    if (dietFilter) {
        dietFilter.addEventListener("change", filterRestaurants);
    }

    // Accessibility filter
    if (accessFilter) {
        accessFilter.addEventListener("change", filterRestaurants);
    }

    // Clear filters
    if (clearFilters) {
        clearFilters.addEventListener("click", function () {

            if (searchInput) searchInput.value = "";
            if (dietFilter) dietFilter.value = "all";
            if (accessFilter) accessFilter.value = "all";

            filterRestaurants();
        });
    }

    // Show all restaurants initially
    filterRestaurants();


    // ======================================
    // 2. SUPABASE CONNECTION
    // ======================================

    const SUPABASE_URL =
        "https://ijzpuocfnopawvvpipsv.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_jkAYCNzIfaiTSdqboGdULg_ceWaBIK1";

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


    // ======================================
    // 3. FIND THE RESTAURANTS IN SUPABASE
    // ======================================

    async function initializeReviews() {

        // Get restaurant information from Supabase
        const { data: restaurants, error } =
            await supabaseClient
                .from("restaurants")
                .select("id, name");

        if (error) {
            console.error("Error loading restaurants:", error);
            return;
        }

        // Match each HTML restaurant card to its database record
        for (const card of restaurantCards) {

            const restaurantName =
                card.querySelector("h3").textContent.trim();

            const restaurant = restaurants.find(function (item) {
                return item.name.trim().toLowerCase() ===
                    restaurantName.toLowerCase();
            });

            if (!restaurant) {

                const status =
                    card.querySelector(".review-status");

                if (status) {
                    status.textContent =
                        "Restaurant could not be found in the database.";
                }

                console.error(
                    "Restaurant not found in Supabase:",
                    restaurantName
                );

                continue;
            }

            // Store the actual Supabase restaurant ID
            card.dataset.supabaseRestaurantId = restaurant.id;

            // Load reviews belonging to this restaurant
            await loadReviews(card);
        }
    }


    // ======================================
    // 4. LOAD REVIEWS FOR EACH RESTAURANT
    // ======================================

    async function loadReviews(card) {

        const reviewList =
            card.querySelector(".review-list");

        const status =
            card.querySelector(".review-status");

        const restaurantId =
            card.dataset.supabaseRestaurantId;

        if (!reviewList || !restaurantId) return;

        reviewList.textContent = "Loading reviews...";

        const { data: reviews, error } =
            await supabaseClient
                .from("restaurant_comments")
                .select(`
                    id,
                    restaurant_id,
                    display_name,
                    comment,
                    rating,
                    created_at
                `)
                .eq("restaurant_id", restaurantId)
                .order("created_at", { ascending: false });

        if (error) {

            console.error("Error loading reviews:", error);

            reviewList.textContent =
                "Unable to load reviews.";

            if (status) {
                status.textContent =
                    "Could not retrieve reviews. Please try again.";
            }

            return;
        }

        // Remove the previous reviews before displaying new ones
        reviewList.replaceChildren();

        if (reviews.length === 0) {
            reviewList.textContent =
                "No reviews yet. Be the first to leave one!";
            return;
        }

        // Display each review
        reviews.forEach(function (review) {

            const reviewItem = document.createElement("div");
            reviewItem.className = "review-item";

            const name = document.createElement("h5");
            name.textContent = review.display_name;

            const stars = document.createElement("p");

            stars.textContent =
                "★".repeat(review.rating) +
                "☆".repeat(5 - review.rating);

            const comment = document.createElement("p");
            comment.textContent = review.comment;

            const date = document.createElement("small");

            date.textContent = review.created_at
                ? new Date(review.created_at).toLocaleDateString()
                : "";

            reviewItem.append(name, stars, comment, date);

            reviewList.appendChild(reviewItem);
        });

    }


    // ======================================
    // 5. SUBMIT A REVIEW FOR EACH RESTAURANT
    // ======================================

    restaurantCards.forEach(function (card) {

        const form = card.querySelector(".review-form");

        if (!form) return;

        form.addEventListener("submit", async function (event) {

            event.preventDefault();

            const status =
                card.querySelector(".review-status");

            const submitButton =
                form.querySelector('button[type="submit"]');

            const restaurantId =
                card.dataset.supabaseRestaurantId;

            const displayName =
                form.querySelector(".review-name").value.trim();

            const rating =
                Number(form.querySelector(".rating-select").value);

            const comment =
                form.querySelector(".review-comment").value.trim();

            // Validate required information
            if (!restaurantId) {

                status.textContent =
                    "Restaurant information is not available.";

                return;
            }

            if (!displayName || !comment ||
                rating < 1 || rating > 5) {

                status.textContent =
                    "Please complete all review fields.";

                return;
            }

            if (displayName.length > 40 ||
                comment.length > 1000) {

                status.textContent =
                    "Please shorten your name or comment.";

                return;
            }

            // Prevent multiple submissions while saving
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";

            status.textContent = "";

            // Save review to Supabase
            const { error } = await supabaseClient
                .from("restaurant_comments")
                .insert({
                    restaurant_id: restaurantId,
                    display_name: displayName,
                    rating: rating,
                    comment: comment
                });

            if (error) {

                console.error("Review submission error:", error);

                status.textContent =
                    "Your review could not be saved. Please try again.";

                submitButton.disabled = false;
                submitButton.textContent = "Submit Review";

                return;
            }

            // Show successful submission
            status.textContent =
                "Your review was submitted successfully!";

            // Clear the form
            form.reset();

            // Reload ONLY this restaurant's reviews
            await loadReviews(card);

            submitButton.disabled = false;
            submitButton.textContent = "Submit Review";

        });

    });


    // ======================================
    // 6. INITIALIZE ALL RESTAURANT REVIEWS
    // ======================================

    initializeReviews();

});
