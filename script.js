
 // EliEats JavaScript
 // Restaurant search, dietary filters, and accessibility filters

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchInput");
    const dietFilter = document.getElementById("dietFilter");
    const accessFilter = document.getElementById("accessFilter");
    const clearFilters = document.getElementById("clearFilters");

    const restaurantCards = document.querySelectorAll(".restaurant-card");
    const noResults = document.getElementById("noResults");
    const resultsCount = document.getElementById("resultsCount");

    function filterRestaurants() {

        const searchText = searchInput.value.trim().toLowerCase();
        const selectedDiet = dietFilter.value;
        const selectedAccess = accessFilter.value;

        let visibleCount = 0;

        restaurantCards.forEach(function (card) {

            // Search all text inside the restaurant card
            const restaurantText = card.textContent.toLowerCase();

            // Read the dietary and accessibility tags from HTML
            const diets = (card.dataset.diet || "").split(/\s+/);
            const accessibility = (card.dataset.access || "").split(/\s+/);

            // Check search term
            const matchesSearch = restaurantText.includes(searchText);

            // Check dietary requirements
            const matchesDiet =
                selectedDiet === "all" ||
                diets.includes(selectedDiet);

            // Check accessibility requirements
            const matchesAccess =
                selectedAccess === "all" ||
                accessibility.includes(selectedAccess);

            // A restaurant must match every selected filter
            const matchesAll =
                matchesSearch && matchesDiet && matchesAccess;

            // Display or hide the restaurant
            card.hidden = !matchesAll;

            if (matchesAll) {
                visibleCount++;
            }

        });

        // Display a message if there are no matches
        if (noResults) {
            noResults.hidden = visibleCount !== 0;
        }

        // Update the number of matching restaurants
        if (resultsCount) {
            resultsCount.textContent =
                `Showing ${visibleCount} of ${restaurantCards.length} restaurants`;
        }
    }

    // Search as the user types
    if (searchInput) {
        searchInput.addEventListener("input", filterRestaurants);
    }

    // Update results when a dietary option is selected
    if (dietFilter) {
        dietFilter.addEventListener("change", filterRestaurants);
    }

    // Update results when an accessibility option is selected
    if (accessFilter) {
        accessFilter.addEventListener("change", filterRestaurants);
    }

    // Reset every filter
    if (clearFilters) {
        clearFilters.addEventListener("click", function () {

            searchInput.value = "";
            dietFilter.value = "all";
            accessFilter.value = "all";

            filterRestaurants();
        });
    }

    // Show all restaurants when the page first loads
    filterRestaurants();
   // Customer reviews and star ratings
const reviewContainer = document.getElementById("restaurantList");

function getReviewKey(card) {
    const name = card.querySelector("h3").textContent.trim();
    return "elieats-reviews-" + name;
}

function renderReviews(card) {
    const reviewList = card.querySelector(".review-list");
    if (!reviewList) return;

    reviewList.replaceChildren();

    let reviews = [];

    try {
        reviews = JSON.parse(
            localStorage.getItem(getReviewKey(card)) || "[]"
        );
    } catch (error) {
        reviews = [];
    }

    if (reviews.length === 0) {
        reviewList.textContent = "No reviews yet. Be the first!";
        return;
    }

    reviews.forEach(function (review) {
        const reviewItem = document.createElement("div");
        reviewItem.className = "review-item";

        const stars = document.createElement("p");
        stars.textContent =
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating);

        const comment = document.createElement("p");
        comment.textContent = review.comment;

        reviewItem.append(stars, comment);
        reviewList.appendChild(reviewItem);
    });
}

// Display saved reviews when the page loads
restaurantCards.forEach(function (card) {
    renderReviews(card);
});

// Handle review submissions
if (reviewContainer) {
    reviewContainer.addEventListener("submit", function (event) {
        if (!event.target.matches(".review-form")) return;

        event.preventDefault();

        const form = event.target;
        const card = form.closest(".restaurant-card");

        const rating = Number(
            form.querySelector(".rating-select").value
        );

        const comment = form.querySelector(".review-comment")
            .value.trim();

        if (!card || rating < 1 || rating > 5 || !comment) {
            return;
        }

        let reviews = [];

        try {
            reviews = JSON.parse(
                localStorage.getItem(getReviewKey(card)) || "[]"
            );
        } catch (error) {
            reviews = [];
        }

        reviews.push({
            rating: rating,
            comment: comment
        });

        try {
            localStorage.setItem(
                getReviewKey(card),
                JSON.stringify(reviews)
            );
        } catch (error) {
            alert("Unable to save your review in this browser.");
            return;
        }

        renderReviews(card);
        form.reset();
    });
}
});
