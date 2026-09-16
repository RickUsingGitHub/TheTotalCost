/* TheTotalCost — petrol ICE vs BEV only. Mid-2026 AU RRP before on-roads. */
window.TTC_PAIRS = [
  { id: "y-rwd-cx5", label: "Tesla Model Y RWD  vs  Mazda CX-5 2.5", note: "Volume EV against the default naturally aspirated petrol family SUV.", bev: { name: "Tesla Model Y RWD", price: 58900, kwh: 15.5, batt: 60, kg: 1920, chem: "LFP" }, ice: { name: "Mazda CX-5 2.5", price: 40190, lpk: 7.2, kg: 1640 } },
  { id: "y-lr-cx5t", label: "Tesla Model Y Long Range  vs  Mazda CX-5 2.5T", note: "Long-range Y against the turbo petrol CX-5.", bev: { name: "Tesla Model Y Long Range", price: 68900, kwh: 14.8, batt: 75, kg: 1995, chem: "NMC" }, ice: { name: "Mazda CX-5 2.5T", price: 47990, lpk: 8.8, kg: 1720 } },
  { id: "sealion7-santafe", label: "BYD Sealion 7  vs  Hyundai Santa Fe 2.5T", note: "Similar money. Family crossover duty.", bev: { name: "BYD Sealion 7", price: 54990, kwh: 16.8, batt: 82, kg: 2225, chem: "LFP" }, ice: { name: "Hyundai Santa Fe 2.5T", price: 53400, lpk: 8.6, kg: 1880 } },
  { id: "ioniq5-tucson", label: "Hyundai Ioniq 5  vs  Hyundai Tucson petrol", note: "Same brand, same showroom.", bev: { name: "Hyundai Ioniq 5 Long Range", price: 76200, kwh: 16.4, batt: 84, kg: 2095, chem: "NMC" }, ice: { name: "Hyundai Tucson 2.0 petrol", price: 38100, lpk: 7.4, kg: 1580 } },
  { id: "ev5-sportage", label: "Kia EV5  vs  Kia Sportage petrol", note: "Sister-brand family SUVs.", bev: { name: "Kia EV5 Air / Earth", price: 52990, kwh: 17.2, batt: 88, kg: 1980, chem: "LFP" }, ice: { name: "Kia Sportage S petrol", price: 36000, lpk: 7.4, kg: 1550 } },
  { id: "atto3-kona", label: "BYD Atto 3  vs  Hyundai Kona petrol", note: "Smaller-medium SUVs.", bev: { name: "BYD Atto 3", price: 39990, kwh: 15.8, batt: 60, kg: 1750, chem: "LFP" }, ice: { name: "Hyundai Kona petrol", price: 32300, lpk: 6.8, kg: 1380 } },
  { id: "ex40-forester", label: "Volvo EX40  vs  Subaru Forester petrol", note: "Premium compact EV against a volume petrol box.", bev: { name: "Volvo EX40 Twin Motor", price: 72990, kwh: 17.4, batt: 82, kg: 2185, chem: "NMC" }, ice: { name: "Subaru Forester 2.5", price: 43490, lpk: 7.4, kg: 1620 } },
  { id: "ariya-xtrail", label: "Nissan Ariya  vs  Nissan X-Trail petrol", note: "Nissan EV against the petrol X-Trail (not e-Power).", bev: { name: "Nissan Ariya Engage+", price: 59990, kwh: 18.2, batt: 87, kg: 2050, chem: "NMC" }, ice: { name: "Nissan X-Trail ST petrol", price: 39990, lpk: 7.8, kg: 1610 } },
  { id: "zs-ev-zs", label: "MG ZS EV  vs  MG ZS petrol", note: "Same badge, two powertrains.", bev: { name: "MG ZS EV Long Range", price: 36990, kwh: 17.4, batt: 68, kg: 1620, chem: "NMC" }, ice: { name: "MG ZS Essence petrol", price: 24990, lpk: 7.3, kg: 1280 } },
  { id: "enyaq-karoq", label: "Skoda Enyaq  vs  Skoda Karoq", note: "European medium EV vs the petrol Karoq.", bev: { name: "Skoda Enyaq 85", price: 62990, kwh: 16.6, batt: 77, kg: 2110, chem: "NMC" }, ice: { name: "Skoda Karoq 1.4 TSI", price: 42990, lpk: 6.9, kg: 1455 } },
  { id: "mache-escape", label: "Ford Mustang Mach-E  vs  Ford Escape", note: "Ford EV crossover against the Escape.", bev: { name: "Ford Mustang Mach-E Select", price: 72990, kwh: 18.5, batt: 91, kg: 2100, chem: "NMC" }, ice: { name: "Ford Escape ST-Line", price: 39990, lpk: 8.0, kg: 1600 } },
  { id: "zeekr-sorento", label: "Zeekr 7X  vs  Kia Sorento petrol", note: "Large-battery EV vs a petrol three-row family SUV.", bev: { name: "Zeekr 7X Long Range", price: 59990, kwh: 16.5, batt: 100, kg: 2350, chem: "NMC" }, ice: { name: "Kia Sorento S petrol", price: 49990, lpk: 8.4, kg: 1850 } }
];
window.TTC_DEFAULTS = {
  petrol: 2.20, solar: 0.05, offpeak: 0.08, peak: 0.32, publicAc: 0.25, publicDc: 0.55,
  mixSolar: 30, mixOffpeak: 50, mixPeak: 10, mixAc: 5, mixDc: 5,
  annualKm: 12600, iceYears: 16, bevYears: 16, gridG: 640, petrolWtw: 2.85,
  scc: 80, offset: 38, vsl: 5300000, iceHealth: 0.035, bevHealth: 0.012,
  iceMaint: 0.030, bevMaint: 0.012, iceTyre: 0.018, bevTyre: 0.030,
  iceMfgT: 8.0, battKgPerKwhLfp: 55, battKgPerKwhNmc: 75, gliderExtraBevT: 1.5,
  iceInsPct: 2.6, bevInsPct: 3.0, iceRego: 720, bevRego: 720,
  iceResidual: 18, bevResidual: 18, includeSocial: true, includeHealth: true
};
