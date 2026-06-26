export default{
    async fetch(request, env) {
        console.log(request.url);
        const { hostname, pathname } = new URL(request.url);
        const response = await fetch(`https://${hostname}${pathname}.00`);
        const { readable, writable } = new IdentityTransformStream();
        (async () => {
            try {
                await response.body.pipeTo(writable, { preventClose: true });
                for (let i = 1; i < 50; i++) {
                    const index = String(i).padStart(2, '0')
                    const response = await fetch(`https://${hostname}${pathname}.${index}`);
                    await response.body.pipeTo(writable, { preventClose: i !== 49 });
                }
            } catch (e) { await writable.abort(e); }
        })();

        return new Response(readable);
    }
}