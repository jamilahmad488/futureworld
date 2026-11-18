from pathlib import Path

p = Path("FutureWorld_Website/pages/climate.html")
text = p.read_text(encoding="utf-8")

calculator_widget = """
  <!-- FWI Free Public Carbon Offset & Footprint Calculator Utility -->
  <section class="my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        Free Public Utility for Climate Workers
      </div>
      <h2 class="text-2xl font-bold text-white">Carbon Offset & Footprint Calculator</h2>
      <p class="text-sm text-slate-400 mt-1">Compute operational emissions and required net-zero credits instantly on-device.</p>
    </div>

    <form id="fwi-calc-form" class="grid sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-mono text-slate-400 mb-1">Electricity Consumption (kWh)</label>
        <input type="number" id="fwi-elec" value="45000" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 outline-none transition" />
      </div>
      <div>
        <label class="block text-xs font-mono text-slate-400 mb-1">Natural Gas (Therms)</label>
        <input type="number" id="fwi-gas" value="3200" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 outline-none transition" />
      </div>
      <div>
        <label class="block text-xs font-mono text-slate-400 mb-1">Fleet Fuel Usage (Liters)</label>
        <input type="number" id="fwi-fuel" value="12000" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 outline-none transition" />
      </div>
      <div>
        <label class="block text-xs font-mono text-slate-400 mb-1">Business Flight Hours</label>
        <input type="number" id="fwi-flights" value="35" class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-sky-500 outline-none transition" />
      </div>

      <div class="sm:col-span-2 pt-2">
        <button type="submit" class="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-sky-500 to-emerald-400 hover:from-sky-400 hover:to-emerald-300 text-slate-950 shadow-lg transition cursor-pointer">
          Calculate Footprint Now
        </button>
      </div>
    </form>

    <div id="fwi-results" class="hidden p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-sm">
      <div class="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-900 pb-2">
        <span>Analysis Complete</span>
        <span class="text-xs text-slate-500">100% Local FWI Engine</span>
      </div>
      <div id="fwi-res-breakdown" class="space-y-1 text-slate-300 text-xs"></div>
      <div class="pt-3 border-t border-slate-900 flex justify-between items-center text-base font-bold">
        <span class="text-slate-400">Total Emissions:</span>
        <span id="fwi-res-total" class="text-white"></span>
      </div>
      <div class="flex justify-between items-center text-base font-bold">
        <span class="text-sky-400">Recommended Credits (w/ 5% Buffer):</span>
        <span id="fwi-res-credits" class="text-sky-300"></span>
      </div>
      <div class="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span class="text-xs text-slate-400 font-sans">Need automated Python code for enterprise VCM parsing?</span>
        <a href="https://futuremind1.gumroad.com/l/cwdcv" target="_blank" class="px-5 py-2.5 rounded-xl text-xs font-bold font-sans bg-sky-500 hover:bg-sky-400 text-slate-950 transition">
          Get Climate & Carbon Pro Edition ($35) →
        </a>
      </div>
    </div>
  </section>

  <script>
    document.getElementById('fwi-calc-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const elec = parseFloat(document.getElementById('fwi-elec').value) || 0;
      const gas = parseFloat(document.getElementById('fwi-gas').value) || 0;
      const fuel = parseFloat(document.getElementById('fwi-fuel').value) || 0;
      const flights = parseFloat(document.getElementById('fwi-flights').value) || 0;

      const e_elec = elec * 0.000415;
      const e_gas = gas * 0.0053;
      const e_fuel = fuel * 0.0023;
      const e_flights = flights * 0.25;

      const total = e_elec + e_gas + e_fuel + e_flights;
      const credits = total * 1.05;

      document.getElementById('fwi-res-breakdown').innerHTML = `
        <div>• Electricity (${elec} kWh): ${e_elec.toFixed(2)} tCO2e</div>
        <div>• Natural Gas (${gas} therms): ${e_gas.toFixed(2)} tCO2e</div>
        <div>• Fleet Fuel (${fuel} L): ${e_fuel.toFixed(2)} tCO2e</div>
        <div>• Flights (${flights} hrs): ${e_flights.toFixed(2)} tCO2e</div>
      `;
      document.getElementById('fwi-res-total').innerText = total.toFixed(3) + ' tCO2e';
      document.getElementById('fwi-res-credits').innerText = credits.toFixed(3) + ' tCO2e';
      document.getElementById('fwi-results').classList.remove('hidden');
    });
  </script>
"""

if "Carbon Offset & Footprint Calculator" in text:
    print("Calculator widget already exists on climate.html.")
else:
    target = "</main>" if "</main>" in text else "</body>"
    pos = text.find(target)
    if pos == -1:
        raise SystemExit("Could not find insertion target in climate.html.")
    
    text = text[:pos] + "\n" + calculator_widget + "\n" + text[pos:]
    p.write_text(text, encoding="utf-8")
    print("Successfully embedded interactive carbon calculator into climate.html!")
