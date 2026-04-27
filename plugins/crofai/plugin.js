(function () {
  var API_URL = "https://crof.ai/usage_api/"

  function probe(ctx) {
    var apiKey = ctx.host.env.get("CROFAI_API_KEY")
    if (!apiKey || !String(apiKey).trim()) {
      throw "No CROFAI_API_KEY found. Set up environment variable first."
    }

    var resp
    try {
      resp = ctx.util.request({
        method: "GET",
        url: API_URL,
        headers: {
          Authorization: "Bearer " + String(apiKey).trim(),
          Accept: "application/json",
        },
        timeoutMs: 10000,
      })
    } catch (e) {
      throw "Usage request failed. Check your connection."
    }

    if (ctx.util.isAuthStatus(resp.status)) {
      throw "API key invalid. Check your CrofAI API key."
    }

    if (resp.status < 200 || resp.status >= 300) {
      throw "Usage request failed (HTTP " + String(resp.status) + "). Try again later."
    }

    var data = ctx.util.tryParseJson(resp.bodyText)
    if (!data) {
      throw "Usage response invalid. Try again later."
    }

    var credits = typeof data.credits === "number" ? data.credits : 0
    var usableRequests = data.usable_requests

    var lines = []

    if (credits > 0) {
      lines.push(
        ctx.line.text({
          label: "Credits",
          value: "$" + credits.toFixed(2),
        })
      )
    }

    if (usableRequests !== null && usableRequests !== undefined) {
      var n = typeof usableRequests === "number" ? usableRequests : 0
      lines.push(
        ctx.line.text({
          label: "Requests",
          value: String(n) + " remaining",
        })
      )
    }

    return { lines: lines }
  }

  globalThis.__openusage_plugin = { id: "crofai", probe }
})()
