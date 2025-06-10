// Toggle class active
const navbarNav = document.querySelector(".navbar-nav");
// ketika humburger menu di klik
document.querySelector("#hamburger-menu").onclick = () => {
  navbarNav.classList.toggle("active");
};

// Klik di luar sidebar untuk menghilangkan nav
const hamburger = document.querySelector("#hamburger-menu");

document.addEventListener("click", function (e) {
  if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});

function konversiSuhu() {
  // Ambil nilai suhu dari input
  const suhu = parseFloat(document.getElementById("inputSuhu").value);

  // Ambil satuan yang dipilih
  const satuan = document.getElementById("satuan").value;

  // Tempat untuk menyimpan hasil
  let hasil = "";

  // Tampilkan hasil ke layar
  document.getElementById("hasil").innerHTML = hasil;
}

function konversiSuhu() {
  const suhu = parseFloat(document.getElementById("inputSuhu").value);
  const satuan = document.getElementById("satuan").value;
  let hasil = "";
  let hasilObj = {};

  if (isNaN(suhu)) {
    hasil = "Masukkan angka suhu yang benar!";
    document.getElementById("hasil").innerHTML = hasil;
    return;
  }

  switch (satuan) {
    case "celcius":
      hasilObj = {
        Fahrenheit: ((suhu * 9) / 5 + 32).toFixed(2),
        Kelvin: (suhu + 273.15).toFixed(2),
        Reamur: ((suhu * 4) / 5).toFixed(2),
      };
      hasil = `
          Fahrenheit: ${hasilObj.Fahrenheit} °F<br>
          Kelvin: ${hasilObj.Kelvin} K<br>
          Reamur: ${hasilObj.Reamur} °Re
        `;
      break;

    case "fahrenheit":
      const c1 = ((suhu - 32) * 5) / 9;
      hasilObj = {
        Celcius: c1.toFixed(2),
        Kelvin: (c1 + 273.15).toFixed(2),
        Reamur: ((c1 * 4) / 5).toFixed(2),
      };
      hasil = `
          Celcius: ${hasilObj.Celcius} °C<br>
          Kelvin: ${hasilObj.Kelvin} K<br>
          Reamur: ${hasilObj.Reamur} °Re
        `;
      break;

    case "kelvin":
      const c2 = suhu - 273.15;
      hasilObj = {
        Celcius: c2.toFixed(2),
        Fahrenheit: ((c2 * 9) / 5 + 32).toFixed(2),
        Reamur: ((c2 * 4) / 5).toFixed(2),
      };
      hasil = `
          Celcius: ${hasilObj.Celcius} °C<br>
          Fahrenheit: ${hasilObj.Fahrenheit} °F<br>
          Reamur: ${hasilObj.Reamur} °Re
        `;
      break;

    case "reamur":
      const c3 = (suhu * 5) / 4;
      hasilObj = {
        Celcius: c3.toFixed(2),
        Fahrenheit: ((c3 * 9) / 5 + 32).toFixed(2),
        Kelvin: (c3 + 273.15).toFixed(2),
      };
      hasil = `
          Celcius: ${hasilObj.Celcius} °C<br>
          Fahrenheit: ${hasilObj.Fahrenheit} °F<br>
          Kelvin: ${hasilObj.Kelvin} K
        `;
      break;
  }

  // Tampilkan hasil
  document.getElementById("hasil").innerHTML = hasil;

  // Tambah ke riwayat
  const riwayatItem = document.createElement("li");
  riwayatItem.innerHTML = `Suhu: ${suhu} (${satuan}) → <br>${hasil}`;
  document.getElementById("riwayat").appendChild(riwayatItem);

  // Update grafik
  updateGrafik(suhu, satuan, hasilObj);
}

function updateGrafik(suhu, satuan, hasilObj) {
  console.log("updateGrafik dipanggil");
  console.log("Data:", hasilObj);

  const labels = Object.keys(hasilObj);
  const data = Object.values(hasilObj);

  const ctx = document.getElementById("grafikSuhu").getContext("2d");

  if (chartData) chartData.destroy();

  chartData = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Hasil Konversi (${suhu} ${satuan})`,
          data: data,
          backgroundColor: ["#3498db", "#2ecc71", "#e74c3c", "#9b59b6"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { beginAtZero: false },
      },
    },
  });
}

// Fungsi reset input, hasil, dan riwayat
function resetForm() {
  document.getElementById("inputSuhu").value = "";
  document.getElementById("satuan").value = "celcius";
  document.getElementById("hasil").innerHTML = "";
  document.getElementById("riwayat").innerHTML = "";
}

// Data untuk grafik
let chartData = null;

// Tambahkan Chart.js
const script = document.createElement("script");
script.src = "https://cdn.jsdelivr.net/npm/chart.js";
document.head.appendChild(script);

// Fungsi untuk download riwayat
async function downloadRiwayat() {
  const { jsPDF } = window.jspdf;
  const canvas = document.getElementById("grafikSuhu");
  const grafikImage = canvas.toDataURL("image/png");

  const pdf = new jsPDF();
  pdf.setFontSize(16);
  pdf.text("Riwayat Konversi Suhu", 10, 20);

  const riwayatList = document.querySelectorAll("#riwayat li");
  let y = 30;
  riwayatList.forEach((item) => {
    if (y > 270) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(12);

    // Ambil isi HTML dari <li> dan pisahkan berdasarkan <br>
    const parts = item.innerHTML.split("<br>");

    // Cetak baris pertama (misalnya: "Suhu: -5 (celcius) →")
    pdf.text(`• ${parts[0].replace(/<[^>]*>/g, "")}`, 10, y);
    y += 8;

    // Cetak sisa hasil konversi (Fahrenheit, Kelvin, dst)
    for (let i = 1; i < parts.length; i++) {
      pdf.text(`  ${parts[i].replace(/<[^>]*>/g, "")}`, 14, y);
      y += 8;
    }

    y += 4; // Spasi ekstra antar riwayat
  });

  if (y > 230) {
    pdf.addPage();
    y = 20;
  }

  pdf.setFontSize(14);
  pdf.text("Grafik Konversi", 10, y);
  y += 10;
  pdf.addImage(grafikImage, "PNG", 10, y, 180, 100);

  pdf.save("riwayat_konversi.pdf");
}
