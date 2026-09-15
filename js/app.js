// Mini-sitio de editoriales — Alpine.js, rutas por hash:
//   #/               lista de editoriales
//   #/editorial/:id  detalle de una editorial

async function getJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error('No se pudo conectar con la API de editoriales.');
  }
  if (res.status === 404) throw new Error('La editorial solicitada no existe.');
  if (!res.ok) throw new Error(`La API de editoriales respondió con error ${res.status}.`);
  return res.json();
}

function currentRoute() {
  const match = location.hash.match(/^#\/editorial\/(\d+)\/?$/);
  return match ? { name: 'detail', id: match[1] } : { name: 'list' };
}

document.addEventListener('alpine:init', () => {
  // Evita que una respuesta lenta pise a una más reciente al navegar rápido.
  let lastRequest = 0;

  Alpine.data('editoriales', () => ({
    urls: window.APP_URLS,
    route: currentRoute(),
    publishers: [],
    publisher: null,
    loading: true,
    error: '',

    init() {
      window.addEventListener('hashchange', () => {
        window.scrollTo(0, 0);
        this.load();
      });
      this.load();
    },

    async load() {
      const route = currentRoute();
      const request = ++lastRequest;
      this.route = route;
      this.loading = true;
      this.error = '';

      try {
        if (route.name === 'detail') {
          const publisher = await getJson(`${this.urls.apiEditoriales}/${route.id}`);
          if (request === lastRequest) this.publisher = publisher;
        } else {
          const publishers = await getJson(this.urls.apiEditoriales);
          if (request === lastRequest) this.publishers = publishers;
        }
      } catch (err) {
        if (request === lastRequest) this.error = err.message;
      } finally {
        if (request === lastRequest) this.loading = false;
      }
    }
  }));
});
