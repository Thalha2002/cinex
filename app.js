const movies = [
  { id:1, emoji:'🚀', title:'Stellar Drift', genre:'Sci-Fi', rating:'8.4', duration:'2h 18m', badge:'new' },
  { id:2, emoji:'🦸', title:'Iron Legacy', genre:'Action', rating:'7.9', duration:'2h 35m', badge:'hot' },
  { id:3, emoji:'😂', title:'Wrong Address', genre:'Comedy', rating:'7.2', duration:'1h 52m', badge:null },
  { id:4, emoji:'💔', title:'Before the Rain', genre:'Drama', rating:'8.1', duration:'2h 5m', badge:null },
  { id:5, emoji:'👻', title:'The Hollow', genre:'Horror', rating:'7.6', duration:'1h 48m', badge:'new' },
  { id:6, emoji:'🤖', title:'Chrome City', genre:'Sci-Fi', rating:'8.7', duration:'2h 22m', badge:'hot' },
];

let selectedGenre = 'All';

function renderMovies() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const grid = document.getElementById('movies-grid');
  grid.innerHTML = '';

  movies
    .filter(m => {
      const matchGenre = selectedGenre === 'All' || m.genre === selectedGenre;
      const matchSearch = !query || m.title.toLowerCase().includes(query);
      return matchGenre && matchSearch;
    })
    .forEach(m => {
      const card = document.createElement('div');
      card.className = 'movie-card';
      card.innerHTML = `
        <div class="movie-poster">
          ${m.emoji}
          ${m.badge ? `<span class="movie-badge badge-${m.badge}">${m.badge}</span>` : ''}
        </div>
        <div class="movie-info">
          <div class="movie-title">${m.title}</div>
          <div class="movie-meta">${m.duration}</div>
          <div class="movie-rating">★ ${m.rating}</div>
        </div>
      `;
      card.onclick = () => selectMovie(m);
      grid.appendChild(card);
    });
}

function filterMovies() {
  renderMovies();
}

function setGenre(el, genre) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  selectedGenre = genre;
  renderMovies();
}

renderMovies();

const theatres = ['PVR Cinemas', 'INOX Multiplex', 'Cinepolis'];
const showTimes = {
  'PVR Cinemas':   ['10:15 AM', '1:30 PM', '4:45 PM', '8:00 PM'],
  'INOX Multiplex':['11:00 AM', '2:15 PM', '5:30 PM', '9:15 PM'],
  'Cinepolis':     ['9:45 AM',  '12:30 PM','3:45 PM', '7:30 PM'],
};

let selectedMovie = null;
let selectedDate = null;
let selectedTheatre = null;
let selectedTime = null;

function selectMovie(m) {
  selectedMovie = m;
  document.getElementById('hero-emoji').textContent = m.emoji;
  document.getElementById('hero-title').textContent = m.title;
  document.getElementById('hero-duration').textContent = m.duration;
  document.getElementById('hero-rating-val').textContent = m.rating;
  renderDateTabs();
  goTo('shows');
}

function renderDateTabs() {
  const tabs = document.getElementById('date-tabs');
  tabs.innerHTML = '';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today = new Date();

  for (let i = 0; i < 6; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const tab = document.createElement('div');
    tab.className = 'date-tab' + (i === 0 ? ' active' : '');
    tab.innerHTML = `<div class="dt-day">${days[d.getDay()]}</div>
                     <div class="dt-date">${d.getDate()} ${months[d.getMonth()]}</div>`;
    const dateStr = `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    if (i === 0) selectedDate = dateStr;
    tab.onclick = () => {
      document.querySelectorAll('.date-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedDate = dateStr;
    };
    tabs.appendChild(tab);
  }
  renderShowtimes();
}

function renderShowtimes() {
  const list = document.getElementById('showtimes-list');
  list.innerHTML = '';
  theatres.forEach(th => {
    const group = document.createElement('div');
    group.className = 'showtimes-group';
    const timesHtml = showTimes[th].map(t =>
      `<button class="time-btn" onclick="selectShowtime('${th}', '${t}', this)">${t}</button>`
    ).join('');
    group.innerHTML = `<div class="theater-name">🎬 ${th}</div>
                       <div class="times-row">${timesHtml}</div>`;
    list.appendChild(group);
  });
}

function selectShowtime(theatre, time, el) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedTheatre = theatre;
  selectedTime = time;
  setTimeout(() => goTo('seats'), 200);
}

function goTo(screen) {
  document.getElementById('screen-browse').style.display = 'none';
  document.getElementById('screen-shows').style.display = 'none';
  document.getElementById('screen-seats').style.display = 'none';
  document.getElementById('screen-payment').style.display = 'none';
  document.getElementById('screen-confirm').style.display = 'none';

  // Update step indicators
  const steps = { browse: 1, shows: 2, seats: 3, payment: 4, confirm: 4 };
  const currentStep = steps[screen];
  [1, 2, 3, 4].forEach(i => {
    const dot = document.getElementById('s' + i);
    dot.classList.remove('active', 'done');
    if (i < currentStep) {
      dot.classList.add('done');
      dot.textContent = '✓';
    } else if (i === currentStep) {
      dot.classList.add('active');
      dot.textContent = i;
    } else {
      dot.textContent = i;
    }
  });

  if (screen === 'browse') document.getElementById('screen-browse').style.display = 'block';
  if (screen === 'shows')  document.getElementById('screen-shows').style.display = 'block';
  if (screen === 'seats') {
    document.getElementById('screen-seats').style.display = 'block';
    document.getElementById('seats-subtitle').textContent =
      `${selectedMovie.title} · ${selectedDate} · ${selectedTime} · ${selectedTheatre}`;
    buildSeatLayout();
  }
  if (screen === 'payment') {
    document.getElementById('screen-payment').style.display = 'block';
    fillPaymentSummary();
  }
  if (screen === 'confirm') {
    document.getElementById('screen-confirm').style.display = 'block';
  }
}

const prices = { standard: 220, premium: 350 };
let seatLayout = [];
let selectedSeats = [];

function buildSeatLayout() {
  const rows = ['A','B','C','D','E','F','G','H'];
  seatLayout = rows.map((r, ri) => {
    return Array.from({ length: 10 }, (_, ci) => ({
      id: `${r}${ci + 1}`,
      row: r,
      col: ci + 1,
      taken: Math.random() < 0.28,
      premium: ri <= 1,
      selected: false,
    }));
  });
  selectedSeats = [];
  renderSeats();
}

function renderSeats() {
  const grid = document.getElementById('seat-grid');
  grid.innerHTML = '';

  seatLayout.forEach((row, ri) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';

    // Row label
    const label = document.createElement('div');
    label.className = 'row-label';
    label.textContent = ['A','B','C','D','E','F','G','H'][ri];
    rowEl.appendChild(label);

    row.forEach((seat, ci) => {
      // Aisle gap in the middle
      if (ci === 5) {
        const gap = document.createElement('div');
        gap.className = 'seat-gap';
        rowEl.appendChild(gap);
      }

      const el = document.createElement('div');
      el.className = 'seat'
        + (seat.taken    ? ' taken'    : '')
        + (seat.selected ? ' selected' : '')
        + (seat.premium  ? ' premium'  : '');
      el.title = seat.id;

      if (!seat.taken) {
        el.onclick = () => toggleSeat(ri, ci);
      }

      rowEl.appendChild(el);
    });

    grid.appendChild(rowEl);
  });

  updateSummary();
}

function toggleSeat(ri, ci) {
  const seat = seatLayout[ri][ci];
  seat.selected = !seat.selected;
  selectedSeats = seatLayout.flat().filter(s => s.selected);
  renderSeats();
}

function updateSummary() {
  const btn = document.getElementById('proceed-btn');

  if (selectedSeats.length === 0) {
    document.getElementById('sel-seats-label').textContent = '—';
    document.getElementById('sel-price-label').textContent = '—';
    document.getElementById('sel-total-label').textContent = '—';
    btn.classList.remove('enabled');
    return;
  }

  const total = selectedSeats.reduce((sum, s) => sum + (s.premium ? prices.premium : prices.standard), 0);
  const seatIds = selectedSeats.map(s => s.id).join(', ');
  const priceDesc = selectedSeats.some(s => s.premium)
    ? `₹${prices.standard} / ₹${prices.premium} (premium)`
    : `₹${prices.standard} each`;

  document.getElementById('sel-seats-label').textContent = seatIds;
  document.getElementById('sel-price-label').textContent = priceDesc;
  document.getElementById('sel-total-label').textContent = `₹${total}`;
  btn.classList.add('enabled');
}

async function startPayment() {
  const total = selectedSeats.reduce((sum, s) => sum + (s.premium ? prices.premium : prices.standard), 0);

  // Show loading on button
  const btn = document.querySelector('.pay-btn');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  try {
    // Step 1: Create order from backend
    const res = await fetch('http://localhost:3000/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total }),
    });

    const data = await res.json();

    if (!data.success) {
      alert('Failed to create order. Try again.');
      btn.textContent = 'Pay & Confirm →';
      btn.disabled = false;
      return;
    }

    // Step 2: Open Razorpay popup
    const options = {
      key: 'rzp_test_Sel35w8rnzV7FE', // 👈 replace with your Key ID
      amount: data.order.amount,
      currency: 'INR',
      name: 'CineX',
      description: `${selectedMovie.title} - ${selectedSeats.map(s => s.id).join(', ')}`,
      order_id: data.order.id,
      handler: async function (response) {
        // Step 3: Verify payment
        const verifyRes = await fetch('http://localhost:3000/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          confirmBooking(response.razorpay_payment_id);
        } else {
          alert('Payment verification failed. Contact support.');
        }
      },
      prefill: {
        name: document.getElementById('card-name').value || 'Guest',
      },
      theme: {
        color: '#D85A30',
      },
      modal: {
        ondismiss: function () {
          btn.textContent = 'Pay & Confirm →';
          btn.disabled = false;
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert('Something went wrong. Make sure your server is running.');
    btn.textContent = 'Pay & Confirm →';
    btn.disabled = false;
  }
}

function confirmBooking(paymentId) {
  const total = selectedSeats.reduce((sum, s) => sum + (s.premium ? prices.premium : prices.standard), 0);
  document.getElementById('ck-movie').textContent = selectedMovie.title;
  document.getElementById('ck-dt').textContent = `${selectedDate} · ${selectedTime}`;
  document.getElementById('ck-theatre').textContent = selectedTheatre;
  document.getElementById('ck-seats').textContent = selectedSeats.map(s => s.id).join(', ');
  document.getElementById('ck-total').textContent = `₹${total}`;
  goTo('confirm');
}

function restartApp() {
  selectedMovie = null;
  selectedDate = null;
  selectedTime = null;
  selectedTheatre = null;
  selectedSeats = [];
  seatLayout = [];
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  document.querySelector('.pill').classList.add('active');
  selectedGenre = 'All';
  renderMovies();
  goTo('browse');
}

function fillPaymentSummary() {
  const total = selectedSeats.reduce((sum, s) => sum + (s.premium ? prices.premium : prices.standard), 0);
  document.getElementById('pay-movie-label').textContent = selectedMovie.title;
  document.getElementById('pay-seats-label').textContent = selectedSeats.map(s => s.id).join(', ');
  document.getElementById('pay-show-label').textContent = `${selectedDate} · ${selectedTime} · ${selectedTheatre}`;
  document.getElementById('pay-total-label').textContent = `₹${total}`;
}

function setPayMethod(el, method) {
  document.querySelectorAll('.pay-method').forEach(b => b.classList.remove('active'));
  el.classList.add('active');

  document.getElementById('form-card').style.display = 'none';
  document.getElementById('form-upi').style.display = 'none';
  document.getElementById('form-netbanking').style.display = 'none';

  if (method === 'card')       document.getElementById('form-card').style.display = 'block';
  if (method === 'upi')        document.getElementById('form-upi').style.display = 'block';
  if (method === 'netbanking') document.getElementById('form-netbanking').style.display = 'block';
}

function selectUpiApp(el) {
  document.querySelectorAll('.upi-app').forEach(a => a.classList.remove('active'));
  el.classList.add('active');
}

function selectBank(el) {
  document.querySelectorAll('.bank-item').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
}
// Start the app


