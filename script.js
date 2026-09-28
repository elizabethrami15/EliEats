
// EliEats JavaScript

// EliEats Restaurant Search

const searchInput = document.getElementById("searchInput");
const dietFilter = document.getElementById("dietFilter");
const restaurantCards = document.querySelectorAll(".restaurant-card");

function filterRestaurants() {

    const searchText = searchInput.value.toLowerCase();
    const selectedDiet = dietFilter.value;

    restaurantCards.forEach(function(card) {

        const restaurantName = card.querySelector("h3").textContent.toLowerCase();
        const diets = card.dataset.diet;

        const matchesSearch = restaurantName.includes(searchText);

        const matchesDiet =
            selectedDiet === "all" ||
            diets.includes(selectedDiet);

        if (matchesSearch && matchesDiet) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });
}

searchInput.addEventListener("input", filterRestaurants);
dietFilter.addEventListener("change", filterRestaurants);
