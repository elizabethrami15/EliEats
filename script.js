
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
        // ======================================
// GOOGLE PHOTOS BUTTONS
// ======================================

const googleRestaurantSearches = {
    "Inheritance Juicery Downtown":
        "Inheritance Juicery Downtown, Tulsa, Oklahoma",

    "Fixins Soul Kitchen":
        "Fixins Soul Kitchen, 222 N Detroit Avenue, Tulsa, Oklahoma",

    "Bull In The Alley":
        "Bull In The Alley, 11 E Reconciliation Way, Tulsa, Oklahoma",

    "NEFF Brewing":
        "NEFF Brewing, 321 S Frankfort Ave, Tulsa, Oklahoma"
    
"in the raw Vū":
    "In The Raw Vū, 110 North Elgin Avenue, Tulsa, Oklahoma",

};

restaurantCards.forEach(function (card) {

    const heading = card.querySelector("h3");
    if (!heading) return;

    const restaurantName = heading.textContent.trim();
    const searchQuery = googleRestaurantSearches[restaurantName];

    if (!searchQuery) return;

    const directionsLink = Array.from(
        card.querySelectorAll("a")
    ).find(function (link) {
        return link.textContent.trim() === "Get Directions";
    });

    if (!directionsLink) return;

    const googleSection = document.createElement("div");
    googleSection.className = "google-photos-section";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "google-photos-button";
    button.textContent = "View Google Photos";

    button.addEventListener("click", function () {
        openGooglePhotos(searchQuery);
    });

    googleSection.appendChild(button);
    directionsLink.closest("p").after(googleSection);
});


// ======================================
// GOOGLE PHOTOS POPUP AND CAROUSEL
// ======================================

let googlePhotoModal = null;

async function openGooglePhotos(searchQuery) {

    if (!window.google || !google.maps) {
        alert("Google Maps could not load. Please try again.");
        return;
    }

    createGooglePhotoModal();

    const imageArea =
        googlePhotoModal.querySelector(".google-photo-image-area");

    const title =
        googlePhotoModal.querySelector(".google-photo-title");

    const attribution =
        googlePhotoModal.querySelector(".google-photo-attribution");

    const mapsLink =
        googlePhotoModal.querySelector(".google-photo-maps-link");

    imageArea.textContent = "Loading Google photos...";
    title.textContent = searchQuery;
    attribution.replaceChildren();
    mapsLink.hidden = true;

    googlePhotoModal.hidden = false;

    try {

        const { Place } =
            await google.maps.importLibrary("places");

        const { places } = await Place.searchByText({
            textQuery: searchQuery,
            fields: [
                "id",
                "displayName",
                "photos",
                "googleMapsURI"
            ],
            maxResultCount: 1
        });

        if (!places || places.length === 0) {
            imageArea.textContent =
                "We couldn't find this restaurant on Google.";
            return;
        }

        const place = places[0];
        const photos = place.photos || [];

        title.textContent =
            place.displayName || searchQuery;

        if (place.googleMapsURI) {
            mapsLink.href = place.googleMapsURI;
            mapsLink.hidden = false;
        }

        if (photos.length === 0) {
            imageArea.textContent =
                "Google does not currently have photos for this restaurant.";
            return;
        }

        let currentPhotoIndex = 0;

        function displayPhoto() {

            const photo = photos[currentPhotoIndex];

            imageArea.replaceChildren();
            attribution.replaceChildren();

            const photoLink = document.createElement("a");

            photoLink.href =
                photo.googleMapsURI || place.googleMapsURI || "#";

            photoLink.target = "_blank";
            photoLink.rel = "noopener noreferrer";

            const image = document.createElement("img");

            image.src = photo.getURI({
                maxWidth: 700,
                maxHeight: 500
            });

            image.alt = "Google photo of " + place.displayName;

            photoLink.appendChild(image);
            imageArea.appendChild(photoLink);

            // Google requires photo author attribution
            (photo.authorAttributions || []).forEach(function (author) {

                const authorLink = document.createElement("a");

                authorLink.textContent = author.displayName;
                authorLink.href = author.uri || place.googleMapsURI;
                authorLink.target = "_blank";
                authorLink.rel = "noopener noreferrer";

                attribution.appendChild(authorLink);
            });

            googlePhotoModal.querySelector(
                ".google-photo-counter"
            ).textContent =
                `${currentPhotoIndex + 1} of ${photos.length}`;
        }

        const previousButton =
            googlePhotoModal.querySelector(".google-photo-previous");

        const nextButton =
            googlePhotoModal.querySelector(".google-photo-next");

        previousButton.onclick = function () {
            currentPhotoIndex =
                (currentPhotoIndex - 1 + photos.length) % photos.length;
            displayPhoto();
        };

        nextButton.onclick = function () {
            currentPhotoIndex =
                (currentPhotoIndex + 1) % photos.length;
            displayPhoto();
        };

        displayPhoto();

    } catch (error) {

        console.error("Google Photos error:", error);

        imageArea.textContent =
            "Unable to load Google photos. Please check your API settings.";
    }
}


// ======================================
// CREATE GOOGLE PHOTOS POPUP
// ======================================

function createGooglePhotoModal() {

    if (googlePhotoModal) return;

    googlePhotoModal = document.createElement("div");
    googlePhotoModal.className = "google-photo-modal";
    googlePhotoModal.hidden = true;

    googlePhotoModal.innerHTML = `
        <div class="google-photo-popup" role="dialog"
             aria-modal="true" aria-label="Google restaurant photos">

            <button type="button"
                class="google-photo-close"
                aria-label="Close photos">×</button>

            <h3 class="google-photo-title"></h3>

            <div class="google-photo-image-area"></div>

            <div class="google-photo-controls">
                <button type="button"
                    class="google-photo-previous"
                    aria-label="Previous photo">❮</button>

                <span class="google-photo-counter"></span>

                <button type="button"
                    class="google-photo-next"
                    aria-label="Next photo">❯</button>
            </div>

            <div class="google-photo-attribution"></div>

            <a class="google-photo-maps-link"
               target="_blank"
               rel="noopener noreferrer"
               hidden>
                View Google Maps Photos & Reviews
            </a>

        </div>
    `;

    document.body.appendChild(googlePhotoModal);

    googlePhotoModal.querySelector(
        ".google-photo-close"
    ).addEventListener("click", closeGooglePhotos);

    googlePhotoModal.addEventListener("click", function (event) {
        if (event.target === googlePhotoModal) {
            closeGooglePhotos();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !googlePhotoModal.hidden) {
            closeGooglePhotos();
        }
    });
}

function closeGooglePhotos() {
    if (googlePhotoModal) {
        googlePhotoModal.hidden = true;
    }
}
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

            const heading = card.querySelector("h3");

            if (!heading) continue;

            const restaurantName = heading.textContent.trim();

            const restaurant = restaurants.find(function (item) {
                return item.name.trim().toLowerCase() ===
                    restaurantName.toLowerCase();
            });

            if (!restaurant) {

                const status = card.querySelector(".review-status");

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

        const reviewList = card.querySelector(".review-list");
        const status = card.querySelector(".review-status");

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
                    created_at,
                    image_urls
                `)
                .eq("restaurant_id", restaurantId)
                .order("created_at", { ascending: false });

        if (error) {

            console.error("Error loading reviews:", error);

            reviewList.textContent = "Unable to load reviews.";

            if (status) {
                status.textContent =
                    "Could not retrieve reviews. Please try again.";
            }

            return;
        }

        // Remove previous reviews before displaying updated reviews
        reviewList.replaceChildren();

        if (!reviews || reviews.length === 0) {
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

            reviewItem.append(name, stars, comment);

            // Display photos attached to the review
            if (review.image_urls && review.image_urls.length > 0) {

                const photoContainer =
                    document.createElement("div");

                photoContainer.className = "review-photos-display";

                review.image_urls.forEach(function (url) {

                    const img = document.createElement("img");

                   img.src = url;
img.alt = "Photo submitted with restaurant review";
img.className = "review-photo";

// Make the photo keyboard-accessible
img.tabIndex = 0;
img.setAttribute("role", "button");
img.setAttribute("aria-label", "Click to enlarge review photo");

img.loading = "lazy";

                    photoContainer.appendChild(img);
                });

                reviewItem.appendChild(photoContainer);
            }

            const date = document.createElement("small");

            date.textContent = review.created_at
                ? new Date(review.created_at).toLocaleDateString()
                : "";

            reviewItem.appendChild(date);
            reviewList.appendChild(reviewItem);
        });
    }
    
// ======================================
// ENLARGE REVIEW PHOTOS
// ======================================

document.addEventListener("click", function (event) {

    if (!event.target.classList.contains("review-photo")) {
        return;
    }

    const lightbox = document.createElement("div");
    lightbox.className = "photo-lightbox";

    const enlargedImage = document.createElement("img");
    enlargedImage.src = event.target.src;
    enlargedImage.alt = event.target.alt;

    const closeButton = document.createElement("button");
    closeButton.className = "photo-lightbox-close";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Close enlarged photo");

    function closeLightbox() {
        lightbox.remove();
        document.removeEventListener("keydown", handleEscape);
    }

    function handleEscape(keyEvent) {
        if (keyEvent.key === "Escape") {
            closeLightbox();
        }
    }

    closeButton.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", function (clickEvent) {
        if (clickEvent.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", handleEscape);

    lightbox.append(closeButton, enlargedImage);
    document.body.appendChild(lightbox);
});

    // ======================================
    // 5. UPLOAD REVIEW PHOTOS
    // ======================================

    async function uploadReviewPhotos(files) {

        const imageUrls = [];

        // Limit uploads to 3 pictures
        if (files.length > 3) {
            throw new Error("You can only upload up to 3 photos.");
        }

        for (const file of files) {

            // Only allow JPG, PNG, and WEBP images
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (!allowedTypes.includes(file.type)) {
                throw new Error(
                    "Please upload JPG, PNG, or WEBP images only."
                );
            }

            // Limit each image to 5 MB
            if (file.size > 5 * 1024 * 1024) {
                throw new Error(
                    "Each photo must be smaller than 5 MB."
                );
            }

            const fileName =
                `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

            const { data, error } = await supabaseClient
                .storage
                .from("review-photos")
                .upload(fileName, file);

            if (error) {
                throw error;
            }

            const { data: publicData } = supabaseClient
                .storage
                .from("review-photos")
                .getPublicUrl(data.path);

            imageUrls.push(publicData.publicUrl);
        }

        return imageUrls;
    }


    // ======================================
    // 6. SUBMIT A REVIEW FOR EACH RESTAURANT
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

            const photoInput =
                form.querySelector(".review-photos");

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

            try {

                // Upload selected photos first
                const selectedPhotos =
                    photoInput ? photoInput.files : [];
                    console.log("Number of photos selected:", selectedPhotos.length);

                const imageUrls =
                    await uploadReviewPhotos(selectedPhotos);

                // Save review and photo URLs to Supabase
                const { error } = await supabaseClient
                    .from("restaurant_comments")
                    .insert({
                        restaurant_id: restaurantId,
                        display_name: displayName,
                        rating: rating,
                        comment: comment,
                        image_urls: imageUrls
                    });

                if (error) {
                    throw error;
                }

                // Show successful submission
                status.textContent =
                    "Your review was submitted successfully!";

                // Clear the form
                form.reset();

                // Reload ONLY this restaurant's reviews
                await loadReviews(card);

            } catch (error) {

                console.error("Review submission error:", error);

                status.textContent =
                    error.message ||
                    "Your review could not be saved. Please try again.";

            } finally {

                submitButton.disabled = false;
                submitButton.textContent = "Submit Review";
            }
        });
    });


    // ======================================
    // 7. INITIALIZE ALL RESTAURANT REVIEWS
    // ======================================

    initializeReviews();

});
