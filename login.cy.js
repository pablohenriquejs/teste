describe('Tela de Login - Poke+', () => {

  beforeEach(() => {
    // Ajuste a URL conforme onde seu projeto está rodando
    cy.visit('http://127.0.0.1:5500/login.html'); 
  });

  it('Deve exibir o título Poke+ no topo da página', () => {
    cy.get('.logo').should('be.visible').and('contain', 'Poke+');
  });

  it('Deve exibir corretamente todos os elementos do formulário de login', () => {
    cy.get('h1').should('contain', 'Bem-vindo de volta!');
    cy.get('p').first().should('contain', 'Entre na sua conta para continuar');

    cy.get('#usuario').should('be.visible').and('have.attr', 'placeholder', 'Digite seu usuário');
    cy.get('#senha').should('be.visible').and('have.attr', 'placeholder', 'Digite sua senha');
    cy.get('.btn-login-page').should('be.visible').and('contain', 'Entrar');
  });

  it('Deve exibir mensagem de erro ao tentar logar sem preencher os campos', () => {
    cy.get('.btn-login-page').click();
    cy.get('#mensagemErro').should('be.visible');
  });

  it('Deve conseguir digitar nos campos de usuário e senha', () => {
    cy.get('#usuario').type('teste@teste.com').should('have.value', 'teste@teste.com');
    cy.get('#senha').type('123456').should('have.value', '123456');
  });

  it('Deve acessar a página de cadastro ao clicar no link "Cadastre-se"', () => {
    cy.contains('Cadastre-se').click();
    cy.url().should('include', 'cadastro.html');
  });

  it('O rodapé deve estar visível e com o texto correto', () => {
    cy.get('footer').should('be.visible');
    cy.get('footer p').should('contain', '© 2025 Poke+. Todos os direitos reservados.');
  });
});
