import os

from playwright.sync_api import sync_playwright


def hash_pick(seed: int, question_id: str) -> int:
    value = ((seed + 1) * 2166136261) & 0xFFFFFFFF
    for character in question_id:
        value ^= ord(character)
        value = (value * 16777619) & 0xFFFFFFFF
    value ^= value >> 16
    value = (value * 2246822507) & 0xFFFFFFFF
    value ^= value >> 13
    return value % 4


def finish_assessment(page, chooser=None) -> None:
    for step in range(40):
        if page.locator("#report-screen").is_visible():
            return
        if page.locator("#transition-screen").is_visible():
            page.locator("#transition-button").click()
            continue
        assert page.locator("#quiz-screen").is_visible()
        options = page.locator(".option-button")
        assert options.count() == 4
        question_id = page.locator("#quiz-screen").get_attribute("data-question-id")
        option_index = chooser(question_id) if chooser else step % 4
        options.nth(option_index).click()
        page.locator("#next-button").click()
    raise AssertionError("assessment did not reach the report screen")


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
        console_errors = []
        page_errors = []
        requests = []
        page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on("request", lambda request: requests.append(request.url))
        port = os.environ.get("MINI_TOOL_PORT", "4173")
        origin = f"http://127.0.0.1:{port}/"
        page.goto(f"{origin}index.html")
        page.wait_for_load_state("networkidle")

        assert page.title() == "班味鉴定所"
        assert page.locator("#home-screen").is_visible()
        assert "你属于哪种" in page.locator("#home-title").inner_text()
        assert "18–21 题动态路径" in page.locator(".home-meta").inner_text()
        page.screenshot(path="D:/Temp/dagongren-v2-home.png", full_page=True)

        page.locator("#identity-options .context-chip").nth(1).click()
        page.locator("#industry-options .context-chip").nth(3).click()
        page.locator("#role-options .context-chip").nth(1).click()
        page.locator("#start-button").click()
        assert page.locator("#progress-label").inner_text() == "01 / 18+"
        page.locator("#next-button").click()
        assert "先选一个真实反应" in page.locator("#quiz-message").inner_text()
        page.locator(".option-button").nth(0).click()
        page.locator("#next-button").click()
        assert page.locator("#progress-label").inner_text() == "02 / 18+"
        page.locator("#back-button").click()
        assert page.locator("#progress-label").inner_text() == "01 / 18+"
        assert page.locator(".option-button").nth(0).get_attribute("aria-checked") == "true"

        # Build the first adaptive route, answer Q13, then change Q12. The stale branch answer must disappear.
        while not page.locator("#progress-label").inner_text().startswith("13 / "):
            if page.locator("#transition-screen").is_visible():
                page.locator("#transition-button").click()
                continue
            page.locator(".option-button").nth(0).click()
            page.locator("#next-button").click()
        page.locator(".option-button").nth(0).click()
        page.locator("#back-button").click()
        assert page.locator("#progress-label").inner_text().startswith("12 / ")
        selected = [page.locator(".option-button").nth(i).get_attribute("aria-checked") for i in range(4)]
        selected_index = selected.index("true")
        page.locator(".option-button").nth((selected_index + 1) % 4).click()
        page.locator("#next-button").click()
        assert page.locator("#transition-screen").is_visible()
        page.locator("#transition-button").click()
        assert page.locator("#progress-label").inner_text().startswith("13 / ")
        assert all(page.locator(".option-button").nth(i).get_attribute("aria-checked") == "false" for i in range(4))

        finish_assessment(page)
        report = page.evaluate("JSON.parse(localStorage.getItem('office-vibe-assessment-report-v2'))")
        assert 18 <= report["routeLength"] <= 21
        assert page.locator("#dimension-list .dimension-row").count() == 9
        assert page.locator("#strength-list li").count() == 3
        assert page.locator("#risk-list li").count() == 3
        assert page.locator("#action-list li").count() == 3
        assert page.locator("#secondary-difference").inner_text()
        assert report["context"]["industryId"] == "education"
        assert report["context"]["roleId"] != "other-role"
        assert page.locator("#radar-canvas").evaluate("canvas => canvas.width > 0 && canvas.height > 0")
        page.screenshot(path="D:/Temp/dagongren-v2-report.png", full_page=True)

        page.locator("#preview-report-button").click()
        assert page.locator("#export-preview").is_visible()
        preview_source = page.locator("#export-preview-image").get_attribute("src")
        assert preview_source.startswith("data:image/jpeg;base64,")
        dimensions = page.locator("#export-preview-image").evaluate(
            "image => new Promise(resolve => { const done = () => resolve([image.naturalWidth, image.naturalHeight]); if (image.complete) done(); else image.onload = done; })"
        )
        assert dimensions == [1080, 2400], dimensions
        page.locator("#export-preview-image").screenshot(path="D:/Temp/dagongren-v2-export.png")
        page.keyboard.press("Escape")
        assert page.locator("#export-preview").is_hidden()
        assert page.evaluate("document.activeElement.id") == "preview-report-button"

        page.reload()
        page.wait_for_load_state("networkidle")
        assert page.locator("#home-screen").is_visible()
        assert page.locator("#last-report-button").is_visible()
        page.locator("#last-report-button").click()
        assert page.locator("#report-screen").is_visible()

        # Find and execute a real longest hidden-result route through the visible UI.
        hidden_seed = page.evaluate("""
          () => {
            const data = window.DagongrenAssessmentData;
            const engine = window.DagongrenAssessmentEngine;
            const anchors = data.questions.filter(question => question.stage === 'anchor');
            const byId = Object.fromEntries(data.questions.map(question => [question.id, question]));
            const hiddenIds = new Set(data.archetypes.filter(type => type.hidden).map(type => type.id));
            const pick = (seed, id) => {
              let hash = Math.imul(seed + 1, 2166136261) >>> 0;
              for (const character of id) { hash ^= character.charCodeAt(0); hash = Math.imul(hash, 16777619); }
              hash ^= hash >>> 16; hash = Math.imul(hash, 2246822507); hash ^= hash >>> 13;
              return (hash >>> 0) % 4;
            };
            for (let seed = 0; seed < 20000; seed += 1) {
              const answers = {};
              anchors.forEach(question => { answers[question.id] = question.options[pick(seed, question.id)].id; });
              const route = engine.buildAdaptiveRoute(answers, data);
              if (route.length !== 21) continue;
              route.slice(12).forEach(id => { answers[id] = byId[id].options[pick(seed, id)].id; });
              const result = engine.createReport(answers, route, data);
              if (hiddenIds.has(result.primaryId)) return { seed, name: result.name };
            }
            return null;
          }
        """)
        assert hidden_seed, "no deterministic 21-question hidden path found"
        page.locator("#restart-button").click()
        finish_assessment(page, lambda question_id: hash_pick(hidden_seed["seed"], question_id))
        hidden_report = page.evaluate("JSON.parse(localStorage.getItem('office-vibe-assessment-report-v2'))")
        assert hidden_report["routeLength"] == 21
        assert hidden_report["name"] == hidden_seed["name"]

        # Corrupted local data must be discarded instead of rendering a broken report.
        page.evaluate("""
          () => {
            localStorage.setItem('office-vibe-assessment-session-v2', JSON.stringify({version:'2.0.0',index:0,route:['a-overtime'],answers:{'a-overtime':'bad'}}));
            localStorage.setItem('office-vibe-assessment-report-v2', JSON.stringify({version:'2.0.0',primaryId:'broken',scores:{}}));
          }
        """)
        page.reload()
        page.wait_for_load_state("networkidle")
        assert page.locator("#home-screen").is_visible()
        assert page.locator("#last-report-button").is_hidden()

        page.set_viewport_size({"width": 360, "height": 800})
        assert page.locator("body").evaluate("element => element.scrollWidth <= window.innerWidth")
        page.set_viewport_size({"width": 430, "height": 932})
        assert page.locator("body").evaluate("element => element.scrollWidth <= window.innerWidth")
        assert not console_errors, console_errors
        assert not page_errors, page_errors
        assert all(url.startswith(origin) for url in requests), requests
        browser.close()


if __name__ == "__main__":
    main()
