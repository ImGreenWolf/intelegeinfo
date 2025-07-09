export async function test(sessionId, problemId) {
    const res = await fetch(`../test/${problemId}`);
    console.log(res.body);
}
