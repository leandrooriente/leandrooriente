export default {
  fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(`https://leandrooriente.com${url.pathname}${url.search}`, 301);
  }
};
