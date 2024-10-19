// Inicializa o IndexedDB
const dbName = 'comentariosDB';
const dbVersion = 1;
let db;

const request = indexedDB.open(dbName, dbVersion);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    const objectStore = db.createObjectStore('comentarios', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('nome', 'nome', { unique: false });
    objectStore.createIndex('comentario', 'comentario', { unique: false });
};

request.onsuccess = (e) => {
    db = e.target.result;
    displayComentarios();
};

request.onerror = (e) => {
    console.error('Erro ao abrir o IndexedDB', e);
};

// Funcionalidade de scroll suave
document.querySelector('.carousel').addEventListener('wheel', (e) => {
    e.preventDefault();
    document.querySelector('.carousel').scrollLeft += e.deltaY;
});

// Funcionalidade para enviar comentários
const comentariosForm = document.getElementById('comentarios-form');
const comentariosLista = document.getElementById('comentarios-lista');

comentariosForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome-comentario').value;
    const comentario = document.getElementById('comentario').value;

    // Adiciona o comentário ao IndexedDB
    const transaction = db.transaction(['comentarios'], 'readwrite');
    const objectStore = transaction.objectStore('comentarios');
    const request = objectStore.add({ nome, comentario });

    request.onsuccess = () => {
        // Adiciona o comentário à lista
        const comentarioDiv = document.createElement('div');
        comentarioDiv.classList.add('comentario');

        const nomeP = document.createElement('p');
        nomeP.textContent = `Nome: ${nome}`;
        comentarioDiv.appendChild(nomeP);

        const comentarioP = document.createElement('p');
        comentarioP.textContent = comentario;
        comentarioDiv.appendChild(comentarioP);

        comentariosLista.appendChild(comentarioDiv);

        // Limpa os campos do formulário após o envio
        comentariosForm.reset();
    };

    request.onerror = (e) => {
        console.error('Erro ao adicionar o comentário', e);
    };
});

// Função para exibir comentários armazenados no IndexedDB
function displayComentarios() {
    const transaction = db.transaction(['comentarios'], 'readonly');
    const objectStore = transaction.objectStore('comentarios');
    const request = objectStore.openCursor();

    request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            const { nome, comentario } = cursor.value;

            const comentarioDiv = document.createElement('div');
            comentarioDiv.classList.add('comentario');

            const nomeP = document.createElement('p');
            nomeP.textContent = `Nome: ${nome}`;
            comentarioDiv.appendChild(nomeP);

            const comentarioP = document.createElement('p');
            comentarioP.textContent = comentario;
            comentarioDiv.appendChild(comentarioP);

            comentariosLista.appendChild(comentarioDiv);

            cursor.continue();
        }
    };

    request.onerror = (e) => {
        console.error('Erro ao buscar comentários', e);
    };
}
