(function () {
  const $ = (id) => document.getElementById(id);
  const fmt = (n, d = 0) => (Number.isFinite(n) ? n : 0).toLocaleString("en-AU", { minimumFractionDigits: d, maximumFractionDigits: d });
  const money = (n) => "$" + fmt(n, n >= 100 ? 0 : 2);
  const moneyK = (n) => Math.abs(n) >= 1000 ? "$" + fmt(n, 0) : "$" + fmt(n, 2);
  function fillPairs() {
    const sel = $("pair");
    window.TTC_PAIRS.forEach((p) => { const o = document.createElement("option"); o.value = p.id; o.textContent = p.label; sel.appendChild(o); });
    const custom = document.createElement("option"); custom.value = "custom"; custom.textContent = "Custom vehicles (edit fields below)"; sel.appendChild(custom);
  }
  function set(id, v) { const el = $(id); if (el) el.value = v; }
  function num(id) { return parseFloat($(id).value) || 0; }
  function applyDefaults() {
    const d = window.TTC_DEFAULTS;
    Object.entries({ petrol:d.petrol,solar:d.solar,offpeak:d.offpeak,peak:d.peak,publicAc:d.publicAc,publicDc:d.publicDc,mixSolar:d.mixSolar,mixOffpeak:d.mixOffpeak,mixPeak:d.mixPeak,mixAc:d.mixAc,mixDc:d.mixDc,annualKm:d.annualKm,years:d.years,gridG:d.gridG,petrolWtw:d.petrolWtw,scc:d.scc,offset:d.offset,vsl:d.vsl,iceHealth:d.iceHealth,bevHealth:d.bevHealth,iceMaint:d.iceMaint,bevMaint:d.bevMaint,iceTyre:d.iceTyre,bevTyre:d.bevTyre,insurancePct:d.insurancePct,regoYear:d.regoYear,residualPct:d.residualPct }).forEach(([k,v]) => set(k,v));
    $("includeSocial").checked = d.includeSocial; $("includeHealth").checked = d.includeHealth; $("includeOffsetLine").checked = d.includeOffsetLine;
    applyPair();
  }
  function currentPair() {
    const id = $("pair").value;
    if (id === "custom") return { id:"custom", label:"Custom pair", note:"Your numbers.", bev:{ name:$("cBevName").value||"Custom BEV", price:num("cBevPrice"), kwh:num("cBevKwh"), batt:num("cBevBatt"), kg:num("cBevKg"), chem:$("cBevChem").value }, ice:{ name:$("cIceName").value||"Custom ICE", price:num("cIcePrice"), lpk:num("cIceLpk"), hybrid:$("cIceHybrid").checked, kg:num("cIceKg") } };
    return window.TTC_PAIRS.find((p) => p.id === id) || window.TTC_PAIRS[0];
  }
  function applyPair() {
    const p = currentPair(); const custom = $("pair").value === "custom";
    $("customBox").style.display = custom ? "block" : "none";
    if (!custom) {
      $("cBevName").value=p.bev.name; $("cBevPrice").value=p.bev.price; $("cBevKwh").value=p.bev.kwh; $("cBevBatt").value=p.bev.batt; $("cBevKg").value=p.bev.kg; $("cBevChem").value=p.bev.chem;
      $("cIceName").value=p.ice.name; $("cIcePrice").value=p.ice.price; $("cIceLpk").value=p.ice.lpk; $("cIceKg").value=p.ice.kg; $("cIceHybrid").checked=!!p.ice.hybrid;
    }
    $("pairNote").textContent = p.note || ""; calc();
  }
  function mixNorm() {
    let s = num("mixSolar")+num("mixOffpeak")+num("mixPeak")+num("mixAc")+num("mixDc"); if (s<=0) s=1;
    return { solar:num("mixSolar")/s, offpeak:num("mixOffpeak")/s, peak:num("mixPeak")/s, ac:num("mixAc")/s, dc:num("mixDc")/s, raw:s };
  }
  function blendedElec(m) { return m.solar*num("solar")+m.offpeak*num("offpeak")+m.peak*num("peak")+m.ac*num("publicAc")+m.dc*num("publicDc"); }
  function calc() {
    const p = currentPair(); const m = mixNorm();
    $("mixWarn").style.display = Math.abs(m.raw-100)>0.5 ? "block" : "none";
    $("mixSum").textContent = fmt(m.raw,0)+"%"; $("elecBlend").textContent = (blendedElec(m)*100).toFixed(1)+" c/kWh";
    const kmYear=num("annualKm"), years=num("years"), lifeKm=kmYear*years;
    $("lifeKm").textContent = fmt(lifeKm,0)+" km";
    const elec=blendedElec(m), petrol=num("petrol");
    const iceFuelPerKm=(p.ice.lpk/100)*petrol, bevFuelPerKm=(p.bev.kwh/100)*elec;
    const iceMaint=num("iceMaint")+num("iceTyre"), bevMaint=num("bevMaint")+num("bevTyre");
    const iceCapNet=p.ice.price*(1-num("residualPct")/100), bevCapNet=p.bev.price*(1-num("residualPct")/100);
    const iceCapKm=lifeKm?iceCapNet/lifeKm:0, bevCapKm=lifeKm?bevCapNet/lifeKm:0;
    const iceInsKm=(p.ice.price*num("insurancePct"))/100/kmYear, bevInsKm=(p.bev.price*num("insurancePct"))/100/kmYear, regoKm=num("regoYear")/kmYear;
    const iceCashKm=iceCapKm+iceFuelPerKm+iceMaint+iceInsKm+regoKm, bevCashKm=bevCapKm+bevFuelPerKm+bevMaint+bevInsKm+regoKm;
    const iceCashLife=iceCashKm*lifeKm, bevCashLife=bevCashKm*lifeKm;
    const gridKg=num("gridG")/1000, solarKg=0.055;
    const blendedGridKg=m.solar*solarKg+(m.offpeak+m.peak+m.ac+m.dc)*gridKg;
    const iceGhgUse=(p.ice.lpk/100)*num("petrolWtw")*1000, bevGhgUse=(p.bev.kwh/100)*blendedGridKg*1000;
    const d=window.TTC_DEFAULTS;
    const battFactor=p.bev.chem==="LFP"?d.battKgPerKwhLfp:d.battKgPerKwhNmc;
    const bevMfgT=d.iceMfgT+d.gliderExtraBevT+(p.bev.batt*battFactor)/1000, iceMfgT=d.iceMfgT;
    const iceGhgMfg=lifeKm?(iceMfgT*1e6)/lifeKm:0, bevGhgMfg=lifeKm?(bevMfgT*1e6)/lifeKm:0;
    const iceGhg=iceGhgUse+iceGhgMfg, bevGhg=bevGhgUse+bevGhgMfg;
    const iceT=(iceGhg*lifeKm)/1e6, bevT=(bevGhg*lifeKm)/1e6;
    const scc=num("scc"), off=num("offset");
    const iceClimate=(iceT*scc)/lifeKm, bevClimate=(bevT*scc)/lifeKm, iceOff=(iceT*off)/lifeKm, bevOff=(bevT*off)/lifeKm;
    const iceH=num("iceHealth"), bevH=num("bevHealth");
    let iceSocialKm=iceCashKm, bevSocialKm=bevCashKm;
    if ($("includeSocial").checked) { iceSocialKm+=iceClimate; bevSocialKm+=bevClimate; }
    if ($("includeHealth").checked) { iceSocialKm+=iceH; bevSocialKm+=bevH; }
    const iceDeaths=lifeKm?(iceH*lifeKm)/num("vsl"):0, bevDeaths=lifeKm?(bevH*lifeKm)/num("vsl"):0;
    render({ p,lifeKm,years,kmYear,iceFuelPerKm,bevFuelPerKm,iceMaint,bevMaint,iceCapKm,bevCapKm,iceInsKm,bevInsKm,regoKm,iceCashKm,bevCashKm,iceCashLife,bevCashLife,iceGhg,bevGhg,iceT,bevT,iceMfgT,bevMfgT,iceClimate,bevClimate,iceOff,bevOff,iceH,bevH,iceSocialKm,bevSocialKm,iceDeaths,bevDeaths,scc,off });
  }
  function render(x) {
    $("iceName").textContent=x.p.ice.name; $("bevName").textContent=x.p.bev.name;
    $("icePrice").textContent=money(x.p.ice.price); $("bevPrice").textContent=money(x.p.bev.price);
    $("iceEff").textContent=x.p.ice.lpk.toFixed(1)+" L/100 km"+(x.p.ice.hybrid?" (hybrid)":"");
    $("bevEff").textContent=x.p.bev.kwh.toFixed(1)+" kWh/100 km · "+x.p.bev.batt+" kWh "+x.p.bev.chem;
    $("icePerKm").textContent=money(x.iceCashKm); $("bevPerKm").textContent=money(x.bevCashKm);
    $("iceLife").textContent=moneyK(x.iceCashLife); $("bevLife").textContent=moneyK(x.bevCashLife);
    $("iceG").textContent=fmt(x.iceGhg,0); $("bevG").textContent=fmt(x.bevGhg,0);
    $("iceTon").textContent=fmt(x.iceT,1)+" t"; $("bevTon").textContent=fmt(x.bevT,1)+" t";
    const cashWinner=x.bevCashKm<x.iceCashKm?"bev":"ice";
    $("iceCard").classList.toggle("winner", cashWinner==="ice"); $("bevCard").classList.toggle("winner", cashWinner==="bev");
    const maxCash=Math.max(x.iceCashKm,x.bevCashKm,0.01), maxG=Math.max(x.iceGhg,x.bevGhg,1);
    $("iceCashBar").style.width=(100*x.iceCashKm/maxCash)+"%"; $("bevCashBar").style.width=(100*x.bevCashKm/maxCash)+"%";
    $("iceGhgBar").style.width=(100*x.iceGhg/maxG)+"%"; $("bevGhgBar").style.width=(100*x.bevGhg/maxG)+"%";
    const saveCash=x.iceCashLife-x.bevCashLife, saveG=x.iceT-x.bevT;
    $("verdictCash").textContent=saveCash>=0?"BEV cheaper by "+moneyK(saveCash)+" over the modelled life.":"ICE cheaper by "+moneyK(-saveCash)+" over the modelled life.";
    $("verdictGhg").textContent=saveG>=0?"BEV avoids "+fmt(saveG,1)+" t CO2e ("+fmt(100*saveG/Math.max(x.iceT,0.01),0)+"% less).":"ICE avoids "+fmt(-saveG,1)+" t CO2e in this scenario.";
    $("iceSocial").textContent=money(x.iceSocialKm); $("bevSocial").textContent=money(x.bevSocialKm);
    $("iceOffLife").textContent=moneyK(x.iceT*x.off); $("bevOffLife").textContent=moneyK(x.bevT*x.off);
    $("iceSccLife").textContent=moneyK(x.iceT*x.scc); $("bevSccLife").textContent=moneyK(x.bevT*x.scc);
    $("iceHealthLife").textContent=moneyK(x.iceH*x.lifeKm); $("bevHealthLife").textContent=moneyK(x.bevH*x.lifeKm);
    $("iceDeaths").textContent=x.iceDeaths.toFixed(4); $("bevDeaths").textContent=x.bevDeaths.toFixed(4);
    const rows=[["Purchase, net of residual",x.iceCapKm,x.bevCapKm],["Energy (petrol / electricity)",x.iceFuelPerKm,x.bevFuelPerKm],["Maintenance + tyres",x.iceMaint,x.bevMaint],["Insurance",x.iceInsKm,x.bevInsKm],["Registration (same default)",x.regoKm,x.regoKm],["Owner cash cost",x.iceCashKm,x.bevCashKm],["Climate (social cost of carbon)",x.iceClimate,x.bevClimate],["Offsets at ACCU-like price (not additive with SCC)",x.iceOff,x.bevOff],["Air-pollution health (tailpipe / tyres+grid)",x.iceH,x.bevH],["Combined owner + selected externalities",x.iceSocialKm,x.bevSocialKm]];
    $("tbody").innerHTML=rows.map((r,i)=>{ const bold=i===5||i===9; return "<tr style=\""+(bold?"font-weight:650":"")+"\"><td>"+r[0]+"</td><td class=\"n\">"+money(r[1])+"</td><td class=\"n\">"+money(r[2])+"</td></tr>"; }).join("");
    $("lifeLine").textContent=fmt(x.years,0)+" years \u00d7 "+fmt(x.kmYear,0)+" km/year = "+fmt(x.lifeKm,0)+" km. Manufacturing assumed "+x.iceMfgT.toFixed(1)+" t CO2e (ICE) vs "+x.bevMfgT.toFixed(1)+" t (BEV).";
  }
  function bind() {
    fillPairs(); applyDefaults();
    document.querySelectorAll("input, select").forEach((el)=> el.addEventListener("input", ()=> el.id==="pair"?applyPair():calc()));
    $("reset").addEventListener("click", applyDefaults);
    $("printBtn").addEventListener("click", ()=> window.print());
  }
  bind();
})();
