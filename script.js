
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

});
