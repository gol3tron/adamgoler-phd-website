/**
 * Cessna 172S takeoff margins + pre-takeoff briefing generator.
 * Speeds and procedures from the 172S POH (Sections 3 and 4).
 */
(function () {
    const S = { vx: 62, vy: 74, at50: 56, flapsUp: 60, glide: 68, efatoUp: 70, efatoDn: 65 };
    const $ = (id) => document.getElementById(id);
    const txt = (id) => $(id).value.trim();
    const fmt = (n, d = 0) => isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d }) : '—';
    function mark(rowId, state) {
        const row = $(rowId);
        row.classList.remove('good', 'warn', 'bad');
        if (state) row.classList.add(state);
    }

    window.render172Briefing = function (p, r) {
        const rwyLen = parseFloat($('to_rwy_len').value);
        const rad = (p.windDirection - p.runwayHeading) * Math.PI / 180;
        const head = p.windSpeed * Math.cos(rad);
        const cross = p.windSpeed * Math.sin(rad);
        const abortSpeed = Math.round(0.7 * r.liftOffSpeed);
        const abortPoint = 0.5 * r.groundRoll * 1.5;
        const abortFrac = abortPoint / rwyLen;
        const margin = rwyLen - r.dist50ft;

        $('res_to_abort').textContent = isFinite(abortFrac)
            ? `${abortSpeed} KIAS by ${fmt(abortPoint)} ft (${fmt(abortFrac * 100)}% of runway)`
            : `${abortSpeed} KIAS by ${fmt(abortPoint)} ft`;
        mark('res_to_abort_row', !isFinite(abortFrac) ? null : abortFrac >= 0.5 ? 'bad' : abortFrac >= 0.35 ? 'warn' : 'good');
        $('res_to_margin').textContent = isFinite(margin)
            ? (margin >= 0 ? `${fmt(margin)} ft to spare` : `${fmt(-margin)} ft more than the runway`)
            : 'Enter runway length';
        mark('res_to_margin_row', !isFinite(margin) ? null : margin < 0 ? 'bad' : margin < 0.5 * r.dist50ft ? 'warn' : 'good');

        const tail = txt('to_tail') || 'N_____';
        const apt = txt('to_apt') || '____';
        const rwy = txt('to_rwy') || '__';
        const landmark = txt('to_landmark');
        const lines = [];
        const L = (s = '') => lines.push(s);
        L(`TAKEOFF BRIEFING: ${tail} (Cessna 172S)`);
        L(`${apt} Runway ${rwy}`);
        L('');
        L('CONDITIONS');
        L(`- Runway ${rwy}: ${isFinite(rwyLen) ? fmt(rwyLen) : '____'} ft available${p.isGrass ? ', grass' : ''}.`);
        L(`- Winds: ${head >= 0 ? fmt(head) + ' kt headwind' : fmt(-head) + ' kt TAILWIND'}, ${Math.abs(cross) < 0.5 ? 'no crosswind' : fmt(Math.abs(cross)) + ' kt crosswind from the ' + (cross > 0 ? 'right' : 'left')}.`);
        L(`- Pressure altitude ${fmt(r.pressureAlt)} ft, ${fmt(p.temperature)} °C. Weight ${fmt(p.weight)} lb.`);
        L('');
        L('TYPE: Short-field takeoff, flaps 10°. Brakes set, full throttle, release.');
        L(`- Ground roll ${fmt(r.groundRoll)} ft. Over 50 ft ${fmt(r.dist50ft)} ft${isFinite(margin) ? (margin >= 0 ? `, ${fmt(margin)} ft to spare` : `. That is ${fmt(-margin)} ft MORE than the runway`) : ''}.`);
        L(`- Lift off around ${r.liftOffSpeed} KIAS. ${S.at50} KIAS until obstacles are clear. Flaps up slowly after ${S.flapsUp} KIAS.`);
        L(`- Then Vy ${S.vy} KIAS. Vx is ${S.vx} KIAS if we need it.`);
        L('');
        L('ABORT CHECKPOINT');
        L(`- ${abortSpeed} KIAS by about ${fmt(abortPoint)} ft${landmark ? ` (${landmark})` : ''}. If we're not there, we abort.`);
        L('');
        L('ENGINE FAILURE OR ANYTHING ABNORMAL ON THE ROLL');
        L('- Throttle idle, brakes, stop straight ahead.');
        L('- Flaps retract, mixture idle cut-off, ignition off, master off.');
        L('');
        L('ENGINE FAILURE AFTER TAKEOFF');
        L(`- Pitch for ${S.efatoUp} KIAS flaps up, ${S.efatoDn} KIAS flaps down.`);
        L('- Land straight ahead, small turns only to miss obstacles.');
        L('- Mixture idle cut-off, fuel shutoff off, ignition off, flaps as required, master off, door unlatched.');
        L(`- Best glide is ${S.glide} KIAS.`);
        L('');
        L('PLAN');
        L(`- Departure: ${txt('to_departure') || '__________'}`);
        L(`- If the engine quits after takeoff: ${txt('to_plan') || '__________'}`);
        L('');
        L(`Pilot flying: ${txt('to_pic') || '__________'}. Positive transfer of controls.`);
        L('Questions?');
        $('briefing').value = lines.join('\n');
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('#takeoff input, #takeoff textarea:not(#briefing)')
            .forEach((el) => el.addEventListener('input', () => window.calculateTakeoff()));
        $('to_copy').addEventListener('click', async () => {
            try { await navigator.clipboard.writeText($('briefing').value); } catch { $('briefing').select(); document.execCommand('copy'); }
            $('to_copy').textContent = 'Copied ✓';
            setTimeout(() => { $('to_copy').textContent = 'Copy'; }, 1500);
        });
        $('to_print').addEventListener('click', () => {
            $('briefing_print').textContent = $('briefing').value;
            window.print();
        });
        window.calculateTakeoff();
    });
})();
