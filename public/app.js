document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const output = document.getElementById("output");
  output.innerHTML = "Chargement...";

  try {
    const resp = await fetch("/api/horoscope", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dateOfBirth: dob, gender })
    });
    if (!resp.ok) {
      const err = await resp.json();
      output.innerHTML = '<div class="result">Erreur: ' + (err.error || resp.statusText) + "</div>";
      return;
    }
    const data = await resp.json();
    output.innerHTML = `
      <div class="result">
        <h2>Signe: ${data.sign}</h2>
        <h3>Prévision du jour</h3><p>${data.predictions.daily}</p>
        <h3>Prévision de la semaine</h3><p>${data.predictions.weekly}</p>
        <h3>Prévision du mois</h3><p>${data.predictions.monthly}</p>
      </div>
    `;
  } catch (err) {
    output.innerHTML = '<div class="result">Erreur réseau</div>';
    console.error(err);
  }
});