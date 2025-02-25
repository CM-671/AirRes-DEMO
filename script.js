console.log("✅ JavaScript file loaded successfully!");

// ✅ Fetch all flights from backend API
async function getAllFlights() {
    try {
        const response = await fetch('https://airline-reservation-backend.onrender.com/api/flights');
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch flights. Status: ${response.status} - ${errorText}`);
        }
        
        const flights = await response.json();
        console.log("✅ Flights fetched successfully:", flights);
        
        return flights;
    } catch (error) {
        console.error("❌ Error fetching flights:", error);
        alert("⚠️ Unable to fetch flight data. Please check the API connection.");
        return [];
    }
}

// ✅ Extract date from departure_time (ISO format)
const extractDate = (dateTimeString) => {
    return new Date(dateTimeString).toISOString().split("T")[0]; // Extract YYYY-MM-DD
};

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM fully loaded!");

    const today = new Date().toISOString().split("T")[0];
    const departureDateInput = document.getElementById("date");
    const returnDateInput = document.getElementById("returnDate");
    const roundTripCheckbox = document.getElementById("roundTrip");
    const returnDateContainer = document.getElementById("returnDateContainer");

    // ✅ Set min date for departure and return dates
    departureDateInput.setAttribute("min", today);
    returnDateInput.setAttribute("min", today);
    
    // Initially disable return date selection and hide it
    returnDateContainer.style.display = "none";
    returnDateInput.disabled = true;

    // ✅ Clicking anywhere in date input opens the calendar
    departureDateInput.addEventListener("click", function () {
        this.showPicker ? this.showPicker() : this.focus();
    });

    returnDateInput.addEventListener("click", function () {
        this.showPicker ? this.showPicker() : this.focus();
    });

    // ✅ Ensure return date is always after the departure date
    departureDateInput.addEventListener("change", function () {
        returnDateInput.setAttribute("min", this.value);
    });

    // ✅ Enable/disable return date when round-trip is checked
    roundTripCheckbox.addEventListener("change", function () {
        if (this.checked) {
            returnDateContainer.style.display = "block"; // Show return date field
            returnDateInput.disabled = false; // Enable return date selection
        } else {
            returnDateContainer.style.display = "none"; // Hide return date field
            returnDateInput.value = ""; // Clear return date value
            returnDateInput.disabled = true; // Disable return date selection
        }
    });

    // ✅ Handle flight search
    document.getElementById("flightForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        console.log("✅ Search button clicked!");

        const originInput = document.getElementById("origin").value.trim();
        const destinationInput = document.getElementById("destination").value.trim();
        const departureDate = departureDateInput.value;
        const returnDate = returnDateInput.value;
        const isRoundTrip = roundTripCheckbox.checked;

        const originCode = originInput ? originInput.toUpperCase() : null;
        const destinationCode = destinationInput ? destinationInput.toUpperCase() : null;

        try {
            document.getElementById("flightResults").innerHTML = `<p>⏳ Searching for flights...</p>`;

            const allFlights = await getAllFlights();
            console.log("📦 API Response:", allFlights);

            // ✅ Extract departure date correctly from API data
            const matchingFlights = allFlights.filter(flight => {
                const flightDateFormatted = extractDate(flight.departure_time);
                console.log(`🔎 Checking: ${flight.origin} → ${flight.destination} on ${flightDateFormatted}`);

                return (!originCode || flight.origin.toUpperCase() === originCode) &&
                       (!destinationCode || flight.destination.toUpperCase() === destinationCode) &&
                       (!departureDate || flightDateFormatted === departureDate);
            });

            let roundTripFlights = [];
            if (isRoundTrip && returnDate) {
                roundTripFlights = allFlights.filter(flight => {
                    const flightDateFormatted = extractDate(flight.departure_time);
                    return (!destinationCode || flight.origin.toUpperCase() === destinationCode) &&
                           (!originCode || flight.destination.toUpperCase() === originCode) &&
                           (!returnDate || flightDateFormatted === returnDate);
                });
            }

            console.log("✈️ Matching Departure Flights:", matchingFlights);
            console.log("🔄 Matching Return Flights:", roundTripFlights);

            displayResults(matchingFlights, roundTripFlights, originInput, destinationInput, departureDate, returnDate, isRoundTrip);
        } catch (error) {
            console.error("❌ Error displaying flights:", error);
        }
    });
});

// ✅ Function to display flights in HTML
function displayResults(departureFlights, returnFlights, origin, destination, departureDate, returnDate, isRoundTrip) {
    let resultsHTML = `<h2>Flight Search Results</h2>`;

    if (departureFlights.length === 0 && (!isRoundTrip || returnFlights.length === 0)) {
        resultsHTML += `<p>⚠️ No flights found matching your criteria.</p>`;
    } else {
        if (departureFlights.length > 0) {
            resultsHTML += `<h3>Departure Flights</h3>`;
            departureFlights.forEach(flight => {
                resultsHTML += generateFlightHTML(flight);
            });
        }

        if (isRoundTrip && returnFlights.length > 0) {
            resultsHTML += `<h3>Return Flights</h3>`;
            returnFlights.forEach(flight => {
                resultsHTML += generateFlightHTML(flight);
            });
        }
    }

    document.getElementById("flightResults").innerHTML = resultsHTML;
}

// ✅ Helper function to generate flight HTML
function generateFlightHTML(flight) {
  
    return `
        <div class="flight-card">
            <p><strong>Flight Number:</strong> ${flight.flight_number}</p>
            <p><strong>Airline:</strong> ${flight.airline}</p>
            <p><strong>Departure:</strong> ${new Date(flight.departure_time).toLocaleString()}</p>
            <p><strong>Departure Airport:</strong> ${flight.origin}</p>
            <p><strong>Destination Airport:</strong> ${flight.destination}</p>
            <p><strong>Arrival Time:</strong> ${flight.arrival_time}</p>
            <p><strong>Duration:</strong> ${flight.duration} hours</p>
            <p><strong>Seats Available:</strong> ${flight.seat_availability}</p>
            <p><strong>Cost:</strong> $${flight.price}</p>
        </div>
    `;
}


