// script.js
document.addEventListener("DOMContentLoaded", () => {

  // Formatar nome da habilidade
  function formatAbilityName(nome) {
    return nome
      .split("-")
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(" ");
  }

  // Criar carta Pokémon
  function criarCartao(pokemon) {
    const tipoPrincipal = pokemon.types[0].type.name;

    const imagem =
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default;

    const habilidades = pokemon.abilities
      .map((h) => formatAbilityName(h.ability.name))
      .join(", ");

    const cartao = document.createElement("div");
    cartao.classList.add("cartao-pokemon");

    cartao.innerHTML = `
      <img src="${imagem}" alt="${pokemon.name}">
      <h3>${pokemon.name}</h3>
      <span class="pokemon-type type-${tipoPrincipal}">
        ${tipoPrincipal}
      </span>
    `;

    cartao.addEventListener("click", () => {
      const modalBody = document.getElementById("modalBody");
      modalBody.innerHTML = `
        <img src="${imagem}" alt="${pokemon.name}">
        <h2>${pokemon.name}</h2>
        <p><strong>ID:</strong> ${pokemon.id}</p>
        <p><strong>Altura:</strong> ${(pokemon.height / 10).toFixed(1)} m</p>
        <p><strong>Peso:</strong> ${(pokemon.weight / 10).toFixed(1)} kg</p>
        <p><strong>Tipo:</strong> ${tipoPrincipal}</p>
        <p><strong>Habilidades:</strong> ${habilidades}</p>
      `;
      document.getElementById("pokemonModal").style.display = "flex";
    });

    return cartao;
  }

  // Busca dinâmica com debounce
  let debounceTimer = null;
  const DEBOUNCE_MS = 300;

  const buscaPokemon = document.getElementById("buscaPokemon");
  const listaPokemons = document.getElementById("listaPokemons");

  buscaPokemon.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {

      const consulta = buscaPokemon.value.trim().toLowerCase();

      if (!consulta) {
        listaPokemons.innerHTML = "<p>Pesquise um Pokémon para começar!</p>";
        return;
      }

      listaPokemons.innerHTML = "<p>Carregando...</p>";

      try {
        // Buscar lista só uma vez
        if (!window.todosPokemons) {
          const resp = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
          const dados = await resp.json();
          window.todosPokemons = dados.results.map(p => p.name);
        }

        const resultados = window.todosPokemons
          .filter(p => p.includes(consulta))
          .slice(0, 12);

        if (resultados.length === 0) {
          listaPokemons.innerHTML = "<p>Nenhum Pokémon encontrado.</p>";
          return;
        }

        // Buscar detalhes de cada Pokémon
        const promessas = resultados.map(nome =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
        );

        const pokemons = await Promise.all(promessas);

        listaPokemons.innerHTML = "";
        pokemons
          .filter(Boolean)
          .forEach(pokemon => listaPokemons.appendChild(criarCartao(pokemon)));

      } catch (err) {
        console.error("Erro na busca:", err);
        listaPokemons.innerHTML = "<p>Erro ao buscar Pokémons.</p>";
      }

    }, DEBOUNCE_MS);
  });

  // Controle de modal
  const modal = document.getElementById("pokemonModal");
  const btnFechar = document.getElementById("modalClose");

  btnFechar.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (evento) => {
    if (evento.target === modal) {
      modal.style.display = "none";
    }
  });
});


