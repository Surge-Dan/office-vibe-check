import os

from playwright.sync_api import sync_playwright


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
        page.goto(f"http://127.0.0.1:{port}/index.html")
        page.wait_for_load_state("networkidle")

        assert page.title() == "班味鉴定所"
        assert page.locator("#home-screen").is_visible()
        assert page.locator("#quiz-screen").is_hidden()
        assert page.locator("#result-screen").is_hidden()

        page.screenshot(path="D:/Temp/dagongren-mini-tool-home.png", full_page=True)
        page.locator("#start-button").click()
        assert page.locator("#quiz-screen").is_visible()
        assert page.locator("#progress-label").inner_text() == "01 / 07"
        assert page.locator(".option-button").count() == 4

        page.locator("#next-button").click()
        assert page.locator("#quiz-message").inner_text() == "先选一个，再继续。"

        page.locator(".option-button").nth(0).click()
        assert page.locator(".option-button").nth(0).get_attribute("aria-checked") == "true"
        page.locator("#next-button").click()
        assert page.locator("#progress-label").inner_text() == "02 / 07"

        page.locator("#back-button").click()
        assert page.locator("#progress-label").inner_text() == "01 / 07"
        assert page.locator(".option-button").nth(0).get_attribute("aria-checked") == "true"

        for question_index in range(7):
            page.locator(".option-button").nth(question_index % 4).click()
            page.locator("#next-button").click()
            if question_index < 6:
                assert page.locator("#progress-label").inner_text() == f"{question_index + 2:02d} / 07"

        assert page.locator("#result-screen").is_visible()
        assert page.locator("#result-name").inner_text()
        assert page.locator("#result-quote").inner_text()
        assert page.locator("#result-quote").evaluate("element => getComputedStyle(element).userSelect") == "text"
        assert page.locator("#result-tags .tag").count() == 3
        page.screenshot(path="D:/Temp/dagongren-mini-tool-result.png", full_page=True)

        page.reload()
        page.wait_for_load_state("networkidle")
        assert page.locator("#last-result-button").is_visible()
        page.locator("#last-result-button").click()
        assert page.locator("#result-screen").is_visible()
        assert page.locator("#result-name").inner_text()
        assert not console_errors, console_errors
        assert not page_errors, page_errors
        assert all(url.startswith(f"http://127.0.0.1:{port}/") for url in requests)

        browser.close()


if __name__ == "__main__":
    main()
