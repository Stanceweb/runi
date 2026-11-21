// Set the College Name field value to "MDUB"
document.addEventListener("DOMContentLoaded", () => {
    const maxRetries = 20;
    const timeInterval = 300;
    let attempts = 0;

    const setCollegeValue = () => {
        const field = document.getElementById("tfa_21");
        if (field) {
            field.value = "MDUB";
        } else if (attempts < maxRetries) {
            attempts++;
            setTimeout(setCollegeValue, timeInterval);
        } else {
            console.warn("Field #tfa_21 not found after multiple attempts.");
        }
    };

    setCollegeValue();
});