/**
 * Cessna 310Q takeoff planning + briefing generator.
 *
 * V-speeds come from the N1311G profile sheets (Leighnor Aircraft), which cite
 * the 310Q Owner's Manual: Figure 2-1 (p. 2-6), Figure 3-1 (p. 3-2), Section I (pp. 1-8, 1-9).
 * Chart values (distances, single-engine climb) are entered by the pilot from the POH.
 */
(function () {
    const SPEEDS = {
        vmc: 75,       // Minimum control speed (red radial)
        rotate: 78,    // Raise nosewheel, normal takeoff
        liftoff: 90,   // Break ground / decision speed, normal takeoff
        vsse: 90,      // Recommended safe single-engine speed
        vxse: 93,      // Best single-engine angle of climb
        vyse: 102,     // Best single-engine rate of climb (blue radial)
        vx: 81,        // Multi-engine best angle
        vy: 107,       // Multi-engine best rate
        mpRotate: 73,  // Max performance: raise nosewheel (flaps 15°)
        mpLiftoff: 78, // Max performance: break ground, hold until obstacles cleared
        decision: 90,
    };
    window.C310Q_SPEEDS = SPEEDS;

    const $ = (id) => document.getElementById(id);
    const num = (id) => { const v = $(id).value.trim(); return v === '' ? NaN : parseFloat(v); };
    const txt = (id) => $(id).value.trim();
    const fmt = (n, d = 0) => isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }) : '—';
    const set = (id, t) => { $(id).textContent = t; };
    function mark(rowId, state) {
        const row = $(rowId);
        row.classList.remove('good', 'warn', 'bad');
        if (state) row.classList.add(state);
    }

    function compute() {
        const C = window.Calculator;
        const maxPerf = $('q_type').value === 'max';
        const rwyLen = num('q_rwy_len');
        const rwyHdg = num('q_rwy_hdg');
        const elev = num('q_elev');
        const altim = num('q_altim');
        const oat = num('q_oat');
        const wDir = num('q_wdir');
        const wSpd = num('q_wspd') || 0;

        const pa = elev + (29.92 - altim) * 1000;
        const isa = 15 - 2 * pa / 1000;
        const da = pa + 120 * (oat - isa);

        let head = 0, cross = 0;
        if (isFinite(rwyHdg) && isFinite(wDir)) {
            const r = (wDir - rwyHdg) * Math.PI / 180;
            head = wSpd * Math.cos(r);
            cross = wSpd * Math.sin(r);
        }

        const gr = num('q_gr');
        const d50 = num('q_d50');
        const asd = num('q_asd');
        const seRoc = num('q_se_roc');
        const reqGrad = num('q_req_grad');
        const seCeil = num('q_se_ceil');
        const mustClear = num('q_must_clear');

        const rotate = maxPerf ? SPEEDS.mpRotate : SPEEDS.rotate;
        const abortSpeed = Math.round(0.7 * rotate);
        // 50-70 rule applied to the book ground roll plus a 50% buffer
        const abortPoint = isFinite(gr) ? 0.5 * gr * 1.5 : NaN;
        const abortFrac = abortPoint / rwyLen;

        const asdMargin = rwyLen - asd;
        const d50Margin = rwyLen - d50;

        // Single-engine climb gradient at blue line
        let seTas = NaN, seGs = NaN, seGrad = NaN;
        if (isFinite(pa) && isFinite(oat)) {
            seTas = C.getTrueAirspeed(SPEEDS.vyse, pa, oat);
            seGs = Math.max(seTas - head, 1);
            if (isFinite(seRoc)) seGrad = C.gradientFromRate(seRoc, seGs);
        }

        const r = { maxPerf, rwyLen, pa, isa, da, oat, head, cross, gr, d50, asd, asdMargin, d50Margin,
            abortSpeed, abortPoint, abortFrac, rotate, seRoc, seTas, seGs, seGrad, reqGrad, seCeil, mustClear, elev };

        // ----- results panel -----
        set('qr_pa', `${fmt(pa)} ft`);
        set('qr_da', isFinite(da) ? `${fmt(da)} ft (ISA ${oat - isa >= 0 ? '+' : ''}${fmt(oat - isa)} °C)` : '—');
        set('qr_wind', `${head >= 0 ? fmt(head) + ' kt headwind' : fmt(-head) + ' kt tailwind'}, ${Math.abs(cross) < 0.5 ? 'no crosswind' : fmt(Math.abs(cross)) + ' kt crosswind from the ' + (cross > 0 ? 'right' : 'left')}`);
        mark('qr_wind_row', head < 0 ? 'warn' : null);

        set('qr_abort', isFinite(abortPoint) ? `${abortSpeed} KIAS by ${fmt(abortPoint, 0)} ft (${fmt(abortFrac * 100)}% of runway)` : 'Enter ground roll');
        mark('qr_abort_row', !isFinite(abortFrac) ? null : abortFrac >= 0.5 ? 'bad' : abortFrac >= 0.35 ? 'warn' : 'good');

        set('qr_d50', isFinite(d50Margin) ? (d50Margin >= 0 ? `${fmt(d50)} ft needed, ${fmt(d50Margin)} ft to spare` : `${fmt(-d50Margin)} ft more than the runway`) : 'Enter chart value');
        mark('qr_d50_row', !isFinite(d50Margin) ? null : d50Margin < 0 ? 'bad' : d50Margin < 0.25 * rwyLen ? 'warn' : 'good');

        set('qr_asd', isFinite(asdMargin) ? (asdMargin >= 0 ? `${fmt(asd)} ft needed, ${fmt(asdMargin)} ft to spare` : `${fmt(-asdMargin)} ft short. Engine failure near ${SPEEDS.decision} KIAS means going off the end or flying`) : 'Enter chart value');
        mark('qr_asd_row', !isFinite(asdMargin) ? null : asdMargin < 0 ? 'bad' : asdMargin < 0.15 * rwyLen ? 'warn' : 'good');

        set('qr_se_grad', isFinite(seGrad) ? `${fmt(seGrad)} ft/nm at ${fmt(seGs)} kt groundspeed` : 'Enter single-engine climb rate');
        mark('qr_se_grad_row', !isFinite(seGrad) || !isFinite(reqGrad) ? null : seGrad >= reqGrad ? 'good' : 'bad');
        set('qr_se_req', isFinite(reqGrad) && isFinite(seGrad) ? (seGrad >= reqGrad ? `Meets ${fmt(reqGrad)} ft/nm` : `${fmt(reqGrad - seGrad)} ft/nm short of ${fmt(reqGrad)} ft/nm`) : '—');
        mark('qr_se_req_row', !isFinite(seGrad) || !isFinite(reqGrad) ? null : seGrad >= reqGrad ? 'good' : 'bad');

        const ceilTarget = isFinite(mustClear) ? mustClear : NaN;
        set('qr_ceil', isFinite(seCeil) && isFinite(ceilTarget) ? (seCeil >= ceilTarget ? `${fmt(seCeil)} ft, ${fmt(seCeil - ceilTarget)} ft above what you need` : `${fmt(seCeil)} ft, ${fmt(ceilTarget - seCeil)} ft below what you need`) : (isFinite(seCeil) ? `${fmt(seCeil)} ft` : '—'));
        mark('qr_ceil_row', isFinite(seCeil) && isFinite(ceilTarget) ? (seCeil >= ceilTarget ? 'good' : 'bad') : null);

        $('briefing').value = briefing(r);
    }

    function briefing(r) {
        const S = SPEEDS;
        const tail = txt('q_tail') || 'N_____';
        const apt = txt('q_apt') || '____';
        const rwy = txt('q_rwy') || '__';
        const landmark = txt('q_landmark');
        const ret = txt('q_return');
        const dep = txt('q_departure');
        const pic = txt('q_pic');
        const lines = [];
        const L = (s = '') => lines.push(s);

        L(`TAKEOFF BRIEFING: ${tail} (Cessna 310Q)`);
        L(`${apt} Runway ${rwy}`);
        L('');
        L('CONDITIONS');
        L(`- Runway ${rwy}: ${fmt(r.rwyLen)} ft available.`);
        L(`- Winds: ${r.head >= 0 ? fmt(r.head) + ' kt headwind' : fmt(-r.head) + ' kt TAILWIND'}, ${Math.abs(r.cross) < 0.5 ? 'no crosswind' : fmt(Math.abs(r.cross)) + ' kt crosswind from the ' + (r.cross > 0 ? 'right' : 'left')}.`);
        L(`- Pressure altitude ${fmt(r.pa)} ft. Density altitude about ${fmt(r.da)} ft.`);
        L('');
        L(r.maxPerf
            ? `TYPE: Maximum performance takeoff. Flaps 15°. Full throttle, 2625 RPM, mixtures leaned for field elevation. Nosewheel up at ${S.mpRotate}, break ground at ${S.mpLiftoff} KIAS, hold ${S.mpLiftoff} until obstacles are clear.`
            : `TYPE: Normal takeoff. Full throttle, 2625 RPM, mixtures leaned for field elevation. Nosewheel up at ${S.rotate}, break ground at ${S.liftoff} KIAS.`);
        L('');
        L('SPEEDS (KIAS)');
        L(`- Vmc (red line) ${S.vmc}`);
        L(`- Safe single-engine ${S.vsse}`);
        L(`- Vxse ${S.vxse} / Vyse (blue line) ${S.vyse}`);
        L(`- Vx ${S.vx} / Vy ${S.vy}`);
        L(`- Decision speed ${S.decision}`);
        L('');
        L('PERFORMANCE (from POH charts)');
        L(`- Ground roll ${fmt(r.gr)} ft. Over 50 ft ${fmt(r.d50)} ft.`);
        L(`- Accelerate-stop ${fmt(r.asd)} ft${isFinite(r.asdMargin) ? (r.asdMargin >= 0 ? `, ${fmt(r.asdMargin)} ft to spare.` : `. That is ${fmt(-r.asdMargin)} ft MORE than the runway.`) : '.'}`);
        if (isFinite(r.seGrad)) L(`- Single-engine climb ${fmt(r.seRoc)} fpm at blue line, about ${fmt(r.seGrad)} ft/nm${isFinite(r.reqGrad) ? ` against ${fmt(r.reqGrad)} ft/nm required` : ''}.`);
        if (isFinite(r.seCeil)) L(`- Single-engine service ceiling ${fmt(r.seCeil)} ft${isFinite(r.mustClear) ? `. We need ${fmt(r.mustClear)} ft` : ''}.`);
        L('');
        L('ABORT CHECKPOINT');
        L(isFinite(r.abortPoint)
            ? `- ${r.abortSpeed} KIAS by about ${fmt(r.abortPoint)} ft down the runway${landmark ? ` (${landmark})` : ''}. If we're not there, we abort.`
            : `- ${r.abortSpeed} KIAS by ____ ft${landmark ? ` (${landmark})` : ''}. If we're not there, we abort.`);
        L('');
        L(`BELOW ${S.decision} KIAS, OR ANY TIME WITH RUNWAY REMAINING`);
        L('- Engine failure or anything abnormal: throttles CLOSE, brakes as required, stop straight ahead.');
        L('');
        L(`ABOVE ${S.decision} KIAS WITH NO RUNWAY AHEAD`);
        L('- Mixtures as required, props full forward, throttles full forward.');
        L('- Gear up.');
        L('- Identify, verify, feather: inoperative throttle CLOSE, mixture IDLE CUT-OFF, prop FEATHER.');
        L('- Bank 5° toward the good engine.');
        L(`- ${S.vsse} KIAS to clear obstacles, then ${S.vyse} KIAS blue line.`);
        L('- Flaps up in small increments. Trim. Secure the dead engine.');
        L('- Land as soon as practical.');
        L('');
        L('PLAN');
        L(`- Departure: ${dep || '__________'}`);
        L(`- If we lose an engine after takeoff: ${ret || '__________'}`);
        L('');
        L(`Pilot flying: ${pic || '__________'}. Positive transfer of controls. Callouts out loud.`);
        L('Questions?');
        return lines.join('\n');
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('#q310 input, #q310 select, #q310 textarea:not(#briefing)')
            .forEach((el) => el.addEventListener('input', compute));
        $('q_copy').addEventListener('click', async () => {
            try { await navigator.clipboard.writeText($('briefing').value); $('q_copy').textContent = 'Copied ✓'; }
            catch { $('briefing').select(); document.execCommand('copy'); $('q_copy').textContent = 'Copied ✓'; }
            setTimeout(() => { $('q_copy').textContent = 'Copy'; }, 1500);
        });
        $('q_print').addEventListener('click', () => {
            $('briefing_print').textContent = $('briefing').value;
            window.print();
        });
        compute();
    });
})();
