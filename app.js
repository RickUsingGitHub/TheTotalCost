(function () {
  const $ = (id) => document.getElementById(id);
  const fmt = (n, d = 0) => (Number.isFinite(n) ? n : 0).toLocaleString("en-AU", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n) => "$" + fmt(n, n >= 100 ? 0 : 2);
  const moneyK = (n) => Math.abs(n) >= 1000 ? "$" + fmt(n, 0) : "$" + fmt(n, 2);
  function fillPairs() {
    const sel = $("pair"); sel.innerHTML = "";
    window.TTC_PAIRS.forEach((p) => { const o = document.createElement("option"); o.value = p.id; o.textContent = p.label; sel.appendChild(o); });
    const custom = document.createElement("option"); custom.value = "custom"; custom.textContent = "Custom vehicles"; sel.appendChild(custom);
  }
  function set(id, v) { const el = $(id); if (el) el.value = v; }
  function num(id) { return parseFloat($(id).value) || 0; }
  function applyDefaults() {
    const d = window.TTC_DEFAULTS;
    Object.entries({ petrol:d.petrol,solar:d.solar,offpeak:d.offpeak,peak:d.peak,publicAc:d.publicAc,publicDc:d.publicDc,mixSolar:d.mixSolar,mixOffpeak:d.mixOffpeak,mixPeak:d.mixPeak,mixAc:d.mixAc,mixDc:d.mixDc,annualKm:d.annualKm,iceYears:d.iceYears,bevYears:d.bevYears,gridG:d.gridG,petrolWtw:d.petrolWtw,scc:d.scc,offset:d.offset,vsl:d.vsl,iceHealth:d.iceHealth,bevHealth:d.bevHealth,iceMaint:d.iceMaint,bevMaint:d.bevMaint,iceTyre:d.iceTyre,bevTyre:d.bevTyre,iceInsPct:d.iceInsPct,bevInsPct:d.bevInsPct,iceRego:d.iceRego,bevRego:d.bevRego,iceResidual:d.iceResidual,bevResidual:d.bevResidual }).forEach(([k,v]) => set(k,v));
    $("includeSocial").checked = d.includeSocial; $("includeHealth").checked = d.includeHealth;
    applyPair(); paintLabs();
  }
  function paintLabs() {
    [["petrol", v => "$"+v],["solar",String],["offpeak",String],["peak",String],["publicAc",String],["publicDc",String],["mixSolar",v=>v+"%"],["mixOffpeak",v=>v+"%"],["mixPeak",v=>v+"%"],["mixAc",v=>v+"%"],["mixDc",v=>v+"%"],["annualKm",v=>fmt(+v,0)],["iceYears",String],["bevYears",String]].forEach(([id,fn]) => { const el=$(id), lab=$(id+"Lab"); if (el && lab) lab.textContent = fn(el.value); });
  }
  function currentPair() {
    if ($("pair").value === "custom") return { id:"custom", label:"Custom pair", note:"Your numbers.", bev:{ name:$("cBevName").value||"Custom BEV", price:num("cBevPrice"), kwh:num("cBevKwh"), batt:num("cBevBatt"), kg:num("cBevKg"), chem:$("cBevChem").value }, ice:{ name:$("cIceName").value||"Custom ICE", price:num("cIcePrice"), lpk:num("cIceLpk"), kg:num("cIceKg") } };
    return window.TTC_PAIRS.find((p) => p.id === $("pair").value) || window.TTC_PAIRS[0];
  }
  function applyPair() {
    const p = currentPair(); const custom = $("pair").value === "custom";
    $("customBox").style.display = custom ? "block" : "none";
    if (!custom) {
      $("cBevName").value=p.bev.name; $("cBevPrice").value=p.bev.price; $("cBevKwh").value=p.bev.kwh; $("cBevBatt").value=p.bev.batt; $("cBevKg").value=p.bev.kg; $("cBevChem").value=p.bev.chem;
      $("cIceName").value=p.ice.name; $("cIcePrice").value=p.ice.price; $("cIceLpk").value=p.ice.lpk; $("cIceKg").value=p.ice.kg;
    }
    $("pairNote").textContent = p.note || ""; calc();
  }
  function mixNorm() {
    let s = num("mixSolar")+num("mixOffpeak")+num("mixPeak")+num("mixAc")+num("mixDc"); if (s<=0) s=1;
    return { solar:num("mixSolar")/s, offpeak:num("mixOffpeak")/s, peak:num("mixPeak")/s, ac:num("mixAc")/s, dc:num("mixDc")/s, raw:s };
  }
  function blendedElec(m) { return m.solar*num("solar")+m.offpeak*num("offpeak")+m.peak*num("peak")+m.ac*num("publicAc")+m.dc*num("publicDc"); }
  function side(kind, p) {
    const kmYear = num("annualKm");
    const years = kind === "ice" ? num("iceYears") : num("bevYears");
    const lifeKm = kmYear * years;
    const residual = kind === "ice" ? num("iceResidual") : num("bevResidual");
    const price = kind === "ice" ? p.ice.price : p.bev.price;
    const capKm = lifeKm ? (price * (1 - residual / 100)) / lifeKm : 0;
    const fuelKm = kind === "ice" ? (p.ice.lpk / 100) * num("petrol") : (p.bev.kwh / 100) * blendedElec(mixNorm());
    const maint = (kind === "ice" ? num("iceMaint") : num("bevMaint")) + (kind === "ice" ? num("iceTyre") : num("bevTyre"));
    const insKm = ((price * (kind === "ice" ? num("iceInsPct") : num("bevInsPct"))) / 100) / Math.max(kmYear, 1);
    const regoKm = (kind === "ice" ? num("iceRego") : num("bevRego")) / Math.max(kmYear, 1);
    const cashKm = capKm + fuelKm + maint + insKm + regoKm;
    const m = mixNorm();
    const useG = kind === "ice" ? (p.ice.lpk / 100) * num("petrolWtw") * 1000 : (p.bev.kwh / 100) * (m.solar * 0.055 + (m.offpeak + m.peak + m.ac + m.dc) * num("gridG") / 1000) * 1000;
    const d = window.TTC_DEFAULTS;
    const mfgT = kind === "ice" ? d.iceMfgT : d.iceMfgT + d.gliderExtraBevT + (p.bev.batt * (p.bev.chem === "LFP" ? d.battKgPerKwhLfp : d.battKgPerKwhNmc)) / 1000;
    const ghg = useG + (lifeKm ? (mfgT * 1e6) / lifeKm : 0);
    const tonnes = (ghg * lifeKm) / 1e6;
    const health = kind === "ice" ? num("iceHealth") : num("bevHealth");
    let social = cashKm;
    if ($("includeSocial").checked) social += (tonnes * num("scc")) / Math.max(lifeKm, 1);
    if ($("includeHealth").checked) social += health;
    return { years, lifeKm, capKm, fuelKm, maint, insKm, regoKm, cashKm, cashLife: cashKm * lifeKm, ghg, tonnes, mfgT, health, social, deaths: lifeKm ? (health * lifeKm) / Math.max(num("vsl"), 1) : 0 };
  }
  function calc() {
    paintLabs();
    const p = currentPair(); const m = mixNorm();
    $("mixWarn").style.display = Math.abs(m.raw - 100) > 0.5 ? "block" : "none";
    $("mixSum").textContent = fmt(m.raw, 0) + "%"; $("elecBlend").textContent = (blendedElec(m) * 100).toFixed(1) + " c/kWh";
    const ice = side("ice", p); const bev = side("bev", p);
    $("iceName").textContent = p.ice.name; $("bevName").textContent = p.bev.name;
    $("icePrice").textContent = money(p.ice.price); $("bevPrice").textContent = money(p.bev.price);
    $("iceEff").textContent = p.ice.lpk.toFixed(1) + " L/100 km";
    $("bevEff").textContent = p.bev.kwh.toFixed(1) + " kWh/100 km \u00b7 " + p.bev.batt + " kWh " + p.bev.chem;
    $("icePerKm").textContent = money(ice.cashKm); $("bevPerKm").textContent = money(bev.cashKm);
    $("iceLife").textContent = moneyK(ice.cashLife); $("bevLife").textContent = moneyK(bev.cashLife);
    $("iceG").textContent = fmt(ice.ghg, 0); $("bevG").textContent = fmt(bev.ghg, 0);
    $("iceTon").textContent = fmt(ice.tonnes, 1) + " t over " + fmt(ice.lifeKm, 0) + " km";
    $("bevTon").textContent = fmt(bev.tonnes, 1) + " t over " + fmt(bev.lifeKm, 0) + " km";
    $("iceCard").classList.toggle("winner", ice.cashKm < bev.cashKm);
    $("bevCard").classList.toggle("winner", bev.cashKm < ice.cashKm);
    const maxCash = Math.max(ice.cashKm, bev.cashKm, 0.01); const maxG = Math.max(ice.ghg, bev.ghg, 1);
    $("iceCashBar").style.width = (100 * ice.cashKm / maxCash) + "%"; $("bevCashBar").style.width = (100 * bev.cashKm / maxCash) + "%";
    $("iceGhgBar").style.width = (100 * ice.ghg / maxG) + "%"; $("bevGhgBar").style.width = (100 * bev.ghg / maxG) + "%";
    $("verdictCash").textContent = bev.cashKm <= ice.cashKm ? "BEV cheaper per km by " + money(ice.cashKm - bev.cashKm) + ". Lifetime totals differ if years kept differ." : "ICE cheaper per km by " + money(bev.cashKm - ice.cashKm) + ". Lifetime totals differ if years kept differ.";
    $("verdictGhg").textContent = bev.ghg <= ice.ghg ? "BEV is " + fmt(ice.ghg - bev.ghg, 0) + " g/km lower (" + fmt(100 * (1 - bev.ghg / Math.max(ice.ghg, 0.01)), 0) + "% less CO2e per km)." : "ICE is lower-carbon per km in this scenario.";
    $("iceSocial").textContent = money(ice.social); $("bevSocial").textContent = money(bev.social);
    $("iceOffLife").textContent = moneyK(ice.tonnes * num("offset")); $("bevOffLife").textContent = moneyK(bev.tonnes * num("offset"));
    $("iceSccLife").textContent = moneyK(ice.tonnes * num("scc")); $("bevSccLife").textContent = moneyK(bev.tonnes * num("scc"));
    $("iceHealthLife").textContent = moneyK(ice.health * ice.lifeKm); $("bevHealthLife").textContent = moneyK(bev.health * bev.lifeKm);
    $("iceDeaths").textContent = ice.deaths.toFixed(4); $("bevDeaths").textContent = bev.deaths.toFixed(4);
    const rows = [["Purchase, net of residual", ice.capKm, bev.capKm],["Energy", ice.fuelKm, bev.fuelKm],["Maintenance + tyres", ice.maint, bev.maint],["Insurance", ice.insKm, bev.insKm],["Registration", ice.regoKm, bev.regoKm],["Owner cash / km", ice.cashKm, bev.cashKm],["Climate (SCC) / km", (ice.tonnes * num("scc")) / Math.max(ice.lifeKm, 1), (bev.tonnes * num("scc")) / Math.max(bev.lifeKm, 1)],["Offset price / km (not added to SCC)", (ice.tonnes * num("offset")) / Math.max(ice.lifeKm, 1), (bev.tonnes * num("offset")) / Math.max(bev.lifeKm, 1)],["Air-pollution health / km", ice.health, bev.health],["Combined / km", ice.social, bev.social]];
    $("tbody").innerHTML = rows.map((r, i) => "<tr style=\"" + (i === 5 || i === 9 ? "font-weight:650" : "") + "\"><td>" + r[0] + "</td><td class=\"n\">" + money(r[1]) + "</td><td class=\"n\">" + money(r[2]) + "</td></tr>").join("");
    $("lifeLine").textContent = "ICE " + ice.years + " yr \u00d7 " + fmt(num("annualKm"), 0) + " = " + fmt(ice.lifeKm, 0) + " km, build " + ice.mfgT.toFixed(1) + " t. BEV " + bev.years + " yr \u00d7 " + fmt(num("annualKm"), 0) + " = " + fmt(bev.lifeKm, 0) + " km, build " + bev.mfgT.toFixed(1) + " t.";
  }
  function bindHelp() {
    const open = () => { $("help").classList.add("open"); $("help").setAttribute("aria-hidden", "false"); };
    const close = () => { $("help").classList.remove("open"); $("help").setAttribute("aria-hidden", "true"); };
    $("helpBtn").addEventListener("click", open);
    $("helpClose").addEventListener("click", close);
    $("help").addEventListener("click", (e) => { if (e.target.id === "help") close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }
  function bind() {
    fillPairs(); applyDefaults(); bindHelp();
    document.querySelectorAll("input, select").forEach((el) => el.addEventListener("input", () => el.id === "pair" ? applyPair() : calc()));
    $("reset").addEventListener("click", applyDefaults);
    $("printBtn").addEventListener("click", () => window.print());
  }
  bind();
})();
