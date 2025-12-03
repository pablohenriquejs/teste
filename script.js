// === LOGIN ===
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("usuario").value.trim();
      const senha = document.getElementById("senha").value.trim();
      const mensagemErro = document.getElementById("mensagemErro");

      const dadosSalvos = JSON.parse(localStorage.getItem("usuarios")) || [];
      const usuarioEncontrado = dadosSalvos.find(
        (u) => u.email === email && u.senha === senha
      );

      if (!email || !senha) {
        mensagemErro.textContent = "Preencha todos os campos.";
        return;
      }

      if (usuarioEncontrado) {
        mensagemErro.style.color = "green";
        mensagemErro.textContent = "Login realizado com sucesso!";
        setTimeout(() => {
          window.location.href = "pokedex.html";
        }, 1000);

      } else {
        mensagemErro.style.color = "red";
        mensagemErro.textContent = "E-mail ou senha incorretos.";
      }
    });
  }
});

// === CADASTRO ===
document.addEventListener("DOMContentLoaded", () => {
  const formCadastro = document.getElementById("cadastroForm");

  if (formCadastro) {
    formCadastro.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("nome").value.trim();
      const email = document.getElementById("email").value.trim();
      const senha = document.getElementById("senhaCadastro").value.trim();
      const confirmar = document.getElementById("confirmarSenha").value.trim();
      const mensagem = document.getElementById("mensagemCadastro");

      if (!nome || !email || !senha || !confirmar) {
        mensagem.textContent = "Preencha todos os campos.";
        return;
      }

      if (senha !== confirmar) {
        mensagem.textContent = "As senhas não coincidem.";
        return;
      }

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const existe = usuarios.some((u) => u.email === email);
      if (existe) {
        mensagem.textContent = "E-mail já cadastrado.";
        return;
      }

      usuarios.push({ nome, email, senha });
      localStorage.setItem("usuarios", JSON.stringify(usuarios));

      mensagem.style.color = "green";
      mensagem.textContent = "Cadastro realizado com sucesso!";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    });
  }
});

// === POKÉDEX ===
document.addEventListener("DOMContentLoaded", () => {
  const listaPokemons = document.getElementById("listaPokemons");
  const buscaPokemon = document.getElementById("buscaPokemon");
  const listaSugestoes = document.getElementById("sugestoesPokemon");

  if (!listaPokemons || !buscaPokemon) return;

  // Mensagem inicial
  listaPokemons.innerHTML = "<p>Pesquise um Pokémon para começar!</p>";

  // Format ability name
  function formatAbilityName(name) {
    return name.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  }

  // Create Pokemon card
  function criarCard(poke) {
    const mainType = poke.types[0].type.name;
    const image = 
      poke.sprites.other["official-artwork"].front_default ||
      poke.sprites.front_default;

    const abilities = poke.abilities
      .map((h) => formatAbilityName(h.ability.name))
      .join(", ");

    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    card.innerHTML = `
      <img src="${image}" alt="${poke.name}">
      <h3>${poke.name}</h3>
      <span class="pokemon-type type-${mainType}">
        ${mainType}
      </span>
    `;

    card.addEventListener("click", () => {
      const modalBody = document.getElementById("modalBody");
      modalBody.innerHTML = `
        <img src="${image}" alt="${poke.name}">
        <h2>${poke.name}</h2>
        <p><strong>ID:</strong> ${poke.id}</p>
        <p><strong>Height:</strong> ${(poke.height / 10).toFixed(1)} m</p>
        <p><strong>Weight:</strong> ${(poke.weight / 10).toFixed(1)} kg</p>
        <p><strong>Type:</strong> ${mainType}</p>
        <p><strong>Abilities:</strong> ${abilities}</p>
      `;
      document.getElementById("pokemonModal").style.display = "flex";
    });

    return card;
  }

  // Busca dinâmica: enquanto digita, mostrar cards correspondentes
  // Implementa debounce para reduzir chamadas à API
  let debounceTimer = null;
  const DEBOUNCE_MS = 300;

  buscaPokemon.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const query = buscaPokemon.value.trim().toLowerCase();

      // se vazio, mostrar mensagem inicial
      if (!query) {
        listaPokemons.innerHTML = "<p>Pesquise um Pokémon para começar!</p>";
        return;
      }

      listaPokemons.innerHTML = "<p>Carregando...</p>";

      try {
        // Buscar a lista de Pokémons apenas uma vez
        if (!window.todosPokemons) {
          const resposta = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
          const data = await resposta.json();
          window.todosPokemons = data.results.map(p => p.name);
        }

        // filtrar nomes que contenham a query
        const matches = window.todosPokemons.filter(p => p.includes(query)).slice(0, 12);

        if (matches.length === 0) {
          listaPokemons.innerHTML = "<p>Nenhum Pokémon encontrado.</p>";
          return;
        }

        // buscar detalhes dos pokémons em paralelo
        const requests = matches.map(name =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${name}`).then(r => (r.ok ? r.json() : null)).catch(() => null)
        );

        const pokes = await Promise.all(requests);

        listaPokemons.innerHTML = "";
        // adicionar cards válidos
        pokes.filter(Boolean).forEach(poke => listaPokemons.appendChild(criarCard(poke)));
      } catch (err) {
        console.error("Erro na busca de pokémons:", err);
        listaPokemons.innerHTML = "<p>Erro ao buscar Pokémons.</p>";
      }
    }, DEBOUNCE_MS);
  });

  // Controle de modal
  const modal = document.getElementById("pokemonModal");
  const closeBtn = document.getElementById("modalClose");

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});