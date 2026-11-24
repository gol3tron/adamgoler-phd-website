/**
 * General flight-planning calculators: time/speed/distance, fuel,
 * wind components, pressure & density altitude, climb gradient.
 * Everything updates live as you type.
 */
(function () {
    const $ = (id) => document.getElementById(id);
    const num = (id) => {
        const v = $(id).value.trim();
        return v === '' ? NaN : parseFloat(v);
    };
    const set = (id, text) => { $(id).textContent = text; };
    const fmt = (n, d = 0) => isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }) : '—';

    // "1:30" -> 90 minutes; "90" -> 90 minutes
    function parseMinutes(str) {
        str = (str || '').trim();
        if (!str) return NaN;
        if (str.includes(':')) {
            const [h, m] = str.split(':').map(Number);
            return (h || 0) * 60 + (m || 0);
        }
        return parseFloat(str);
    }
    function hm(minutes) {
        if (!isFinite(minutes) || minutes < 0) return '—';
        const h = Math.floor(minutes / 60);
        const m = Math.round(minutes - h * 60);
        return h > 0 ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
    }

    // ---------- Time / speed / distance ----------
    function tsd() {
        const gs = num('tsd_gs');
        const dist = num('tsd_dist');
        const time = parseMinutes($('tsd_time').value);
        const known = [isFinite(gs), isFinite(dist), isFinite(time)].filter(Boolean).length;
        let out = 'Fill in any two.';
        if (known >= 2) {
            if (!isFinite(time) && gs > 0) out = `Time: ${hm(dist / gs * 60)}`;
            else if (!isFinite(dist)) out = `Distance: ${fmt(gs * time / 60, 1)} nm`;
            else if (!isFinite(gs) && time > 0) out = `Groundspeed: ${fmt(dist / (time / 60))} kts`;
            else if (known === 3) out = 'Clear one box to solve for it.';
        }
        set('tsd_out', out);
    }

    // ---------- Fuel ----------
    function fuel() {
        const burn = num('fu_burn');
        const gs = num('fu_gs');
        const dist = num('fu_dist');
        const onboard = num('fu_onboard');
        const reserveMin = num('fu_reserve');
        const taxi = num('fu_taxi') || 0;

        const tripMin = gs > 0 && isFinite(dist) ? dist / gs * 60 : NaN;
        const tripFuel = tripMin / 60 * burn;
        const reserveFuel = reserveMin / 60 * burn;
        const required = tripFuel + (isFinite(reserveFuel) ? reserveFuel : 0) + taxi;
        const enduranceMin = burn > 0 ? (onboard - taxi) / burn * 60 : NaN;
        const range = enduranceMin / 60 * gs;
        const landing = onboard - taxi - tripFuel;

        set('fu_time', hm(tripMin));
        set('fu_trip', isFinite(tripFuel) ? `${fmt(tripFuel, 1)} gal` : '—');
        set('fu_req', isFinite(required) ? `${fmt(required, 1)} gal` : '—');
        set('fu_endur', hm(enduranceMin));
        set('fu_range', isFinite(range) ? `${fmt(range)} nm` : '—');

        const row = $('fu_land_row');
        row.classList.remove('good', 'warn', 'bad');
        if (isFinite(landing) && isFinite(burn) && burn > 0) {
            const landingMin = landing / burn * 60;
            set('fu_land', `${fmt(landing, 1)} gal (${hm(Math.max(landingMin, 0))})`);
            if (landing < 0) { row.classList.add('bad'); set('fu_land', `Short by ${fmt(-landing, 1)} gal`); }
            else if (isFinite(reserveMin) && landingMin < reserveMin) row.classList.add('warn');
            else row.classList.add('good');
        } else set('fu_land', '—');
    }

    // ---------- Wind components ----------
    function wind() {
        const rwy = num('wc_rwy');
        const dir = num('wc_dir');
        const spd = num('wc_spd');
        const gust = num('wc_gust');
        if (![rwy, dir, spd].every(isFinite)) { ['wc_head', 'wc_cross', 'wc_gustx'].forEach((i) => set(i, '—')); return; }
        const rad = (dir - rwy) * Math.PI / 180;
        const head = spd * Math.cos(rad);
        const cross = spd * Math.sin(rad);
        set('wc_head', head >= 0 ? `${fmt(head)} kt headwind` : `${fmt(-head)} kt tailwind`);
        set('wc_cross', Math.abs(cross) < 0.5 ? 'None' : `${fmt(Math.abs(cross))} kt from the ${cross > 0 ? 'right' : 'left'}`);
        set('wc_gustx', isFinite(gust) ? `${fmt(Math.abs(gust * Math.sin(rad)))} kt` : '—');
    }

    // ---------- Pressure & density altitude ----------
    function densityAlt() {
        const elev = num('da_elev');
        const alt = num('da_alt');
        const oat = num('da_oat');
        if (![elev, alt].every(isFinite)) { ['da_pa', 'da_isa', 'da_da'].forEach((i) => set(i, '—')); return; }
        const pa = elev + (29.92 - alt) * 1000;
        const isa = 15 - 2 * pa / 1000;
        set('da_pa', `${fmt(pa)} ft`);
        set('da_isa', `${fmt(isa, 1)} °C`);
        if (isFinite(oat)) {
            const da = pa + 120 * (oat - isa);
            set('da_da', `${fmt(da)} ft`);
            set('da_dev', `${oat - isa >= 0 ? '+' : ''}${fmt(oat - isa, 1)} °C`);
        } else { set('da_da', '—'); set('da_dev', '—'); }
    }

    // ---------- Climb gradient quick check ----------
    function gradient() {
        const gs = num('gq_gs');
        const fpm = num('gq_fpm');
        const req = num('gq_req');
        const C = window.Calculator;
        const have = gs > 0 && isFinite(fpm) ? C.gradientFromRate(fpm, gs) : NaN;
        set('gq_have', isFinite(have) ? `${fmt(have)} ft/nm (${fmt(C.gradientToPercent(have), 1)}%)` : '—');
        const need = gs > 0 && isFinite(req) ? C.rateFromGradient(req, gs) : NaN;
        set('gq_need', isFinite(need) ? `${fmt(need)} fpm` : '—');

        const row = $('gq_verdict_row');
        row.classList.remove('good', 'bad');
        if (isFinite(have) && isFinite(req)) {
            const ok = have >= req;
            row.classList.add(ok ? 'good' : 'bad');
            set('gq_verdict', ok ? `Yes, ${fmt(have - req)} ft/nm to spare` : `No, ${fmt(req - have)} ft/nm short`);
        } else set('gq_verdict', '—');
    }

    // ---------- Climb gradient planner ----------
    window.calculateClimb = function () {
        const g = (id) => parseFloat($(id).value);
        const r = window.Calculator.calculateClimbGradient({
            startAlt: g('cl_start_alt'), endAlt: g('cl_end_alt'),
            indicatedAirspeed: g('cl_ias'),
            startClimbRate: g('cl_start_rate'), endClimbRate: g('cl_end_rate'),
            startTemp: g('cl_start_temp'), endTemp: g('cl_end_temp'),
            altimeter: g('cl_altimeter'),
            startWindDir: g('cl_start_wind_dir'), startWindSpeed: g('cl_start_wind_spd'),
            endWindDir: g('cl_end_wind_dir'), endWindSpeed: g('cl_end_wind_spd'),
            startHeading: g('cl_start_heading'), endHeading: g('cl_end_heading'),
        });
        const req = g('cl_required');
        set('res_cl_grad', `${fmt(r.minGradient)} ft/nm (around ${fmt(r.worstAlt)} ft)`);
        set('res_cl_avg', `${fmt(r.avgGradient)} ft/nm`);
        set('res_cl_time', `${fmt(r.timeMin, 1)} min`);
        set('res_cl_dist', `${fmt(r.distanceNm, 1)} nm`);
        set('res_cl_tas', `${fmt(r.maxTas)} KTAS`);
        set('res_cl_gs', `${fmt(r.maxGs)} kts`);

        const row = $('res_cl_verdict_row');
        row.classList.remove('good', 'bad');
        if (isFinite(req) && r.minGradient > 0) {
            const ok = r.minGradient >= req;
            row.classList.add(ok ? 'good' : 'bad');
            set('res_cl_verdict', ok ? `Yes, worst case beats ${fmt(req)} ft/nm` : `No, ${fmt(req - r.minGradient)} ft/nm short at worst`);
        } else set('res_cl_verdict', r.minGradient > 0 ? 'Enter a required gradient to check' : 'Check your inputs');

        const body = $('cl_segments');
        body.innerHTML = r.segments.map((s) =>
            `<tr class="${s.alt === r.worstAlt ? 'worst' : ''}"><td>${fmt(s.alt)}</td><td>${s.rate}</td><td>${s.tas}</td><td>${s.gs}</td><td>${s.gradient}</td></tr>`
        ).join('');
        $('climbResults').style.display = 'block';
    };

    function wire(ids, fn) {
        ids.forEach((id) => $(id) && $(id).addEventListener('input', fn));
        fn();
    }

    document.addEventListener('DOMContentLoaded', () => {
        wire(['tsd_gs', 'tsd_dist', 'tsd_time'], tsd);
        wire(['fu_burn', 'fu_gs', 'fu_dist', 'fu_onboard', 'fu_reserve', 'fu_taxi'], fuel);
        wire(['wc_rwy', 'wc_dir', 'wc_spd', 'wc_gust'], wind);
        wire(['da_elev', 'da_alt', 'da_oat'], densityAlt);
        wire(['gq_gs', 'gq_fpm', 'gq_req'], gradient);
    });
})();
