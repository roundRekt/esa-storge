export default{
    async fetch(request, env) {
        console.log(request.url);
        const url = new URL(request.url);
        const key = url.pathname.slice(1);
        const response = await env.ASSETS.fetch(`https://assets.local/${key}.00`);
        if (!response.ok) {
            const upstream = "https://prod-clientpatch.bluearchiveyostar.com"
            const parts = key.split("/").slice(4);
            const params = url.searchParams;
            const version = params.get("version");
            const suffix = params.get("suffix")
            if (suffix) parts[0] += suffix;
            const path = parts.join("/");
            return Response.redirect(upstream + "/" + version + "/" + path);
        }

        const { readable, writable } = new IdentityTransformStream();
        (async () => {
            try {
                await response.body.pipeTo(writable, { preventClose: true });
                for (let i = 1; i < 50; i++) {
                    const index = String(i).padStart(2, '0')
                    const response = await env.ASSETS.fetch(`https://assets.local/${key}.${index}`);
                    await response.body.pipeTo(writable, { preventClose: i !== 49 });
                }
            } catch (e) { await writable.abort(e); }
        })();

        return new Response(readable);
    }
}