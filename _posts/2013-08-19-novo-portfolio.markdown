---
layout: post
title:  "Novo portfólio. Adeus Wordpress e obrigado pelos peixes"
description: "Sempre que estou atolado de coisas para fazer e sem tempo para dormir refaço o portfólio para me lembrar que poderia ser pior."
tags: general jekyll wordpress "digital ocean"
image_thumb: "/media/thanks-all-the-fish-thumb.jpg"
image_highlight: "/media/thanks-all-the-fish.jpg"
comments: 
- author: matheus
  date: 2013-10-09T17:26:55
  text: |
    <p>Olá!<br>Comecei a fazer a tradução do site e da documentação do Jekyll para o português, <a href="http://jekyllrb.com.br/" rel="nofollow">http://jekyllrb.com.br/</a><br>Se alguém quiser colaborar, segue o endereço do repositório <a href="https://github.com/matheusme/jekyllrb.com.br" rel="nofollow">https://github.com/matheusme/j...</a><br>Contamos com vocês!</p>

- author: Thulio Philipe
  date: 2013-09-28T00:19:38
  text: |
    <p>Assim como você, resolvi criar um blog e tirar a cara de portfólio, sempre gostei de escrever mas o que me faltava era tempo, agora tenho que arrumar de qualquer forma pra escrever rsrs<br>Nem optei pelo wp, pra por logo no ar e com o tempo melhorar, optei pelo Tumblr, pode ser bem bestinha, mas consegui adapta-lo ao que utilizo no momento e está me gerando um resultado legal..<br>Tenho muita curiosidade no Jekyll, vi uma palestra a uns meses atrás que me deixaram fascinados por essa ferramenta, em breve evoluo o meu pra Jekyll :P</p><p>Parabéns pelo trabalho no blog, e continue assim ;)</p>

- author: Leandro Oriente
  date: 2013-09-13T16:40:20
  text: |
    <p>Irado <a data-dsq-mention="disqus_1j7bucmptg:disqus" href="https://disqus.com/by/disqus_1J7bucmpTG/" rel="nofollow">decko</a></p><p>É bem semelhante ao Jekyll pelo que pude notar.<br>Sinceramente me senti mais a vontade com o blog assim escrevendo posts em markdown (no caso do BR-Linux é algo como o utilizado em fóruns né?) do que no Admin do Wordpress.</p><p>Além disso, o fato de gerar estáticos sem ter que se preocupar com uma camada de cache é perfeito.<br>A entrega é realmente muito rápida.</p><p>Fiz uns ajustes básicos de infra e no desenvolvimento do blog e consegui 93 no YSlow.</p><p>Vou dar uma olhada no SPDY. <br>E foi mal a demora. Operei a vista esses dias e fiquei um pouco ausente.</p>

- author: decko
  date: 2013-09-11T01:56:50
  text: |
    <p>Bacana Leandro. Alguns sites bem acessados que estão utilizando a mesma tática pra gerenciar seus conteudos. Um exemplo é o BR-Linux <a href="http://br-linux.org/2013/01/br-linux-troca-wordpress-pelo-axe.html" rel="nofollow">http://br-linux.org/2013/01/br...</a></p><p>Sobre o NGINX se vc se interessar por infra, dê uma olhada no módulo SPDY.</p>

- author: Anderson Menezes
  date: 2013-08-29T18:35:04
  text: |
    <p>Legal, já vi falar muito do Jekyll e na real está crescendo bastante.</p><p>Tá na hr de rola uma artiguinho né, abraços...</p>

- author: Leandro Oriente
  date: 2013-08-22T02:50:28
  text: |
    <p>Acho que Jekyll se restringe bastante a blogs de desenvolvedores.<br>Para quem tem certo conhecimento e não pretende ter centenas ou milhares de posts é uma ferramenta bem enxuta e executa bem o que se propõe a fazer, porém não recomendo que use num portal de conteúdo com maiores pretensões.</p><p>Nesse caso não nadaria contra a maré e investiria no Wordpress mesmo.<br>O Admin dele é muito simples de ser usado. Qualquer leigo em TI pode ser facilmente um editor/autor e ele oferece ferramentas que tornam a gestão do conteúdo mais simples.</p><p>Seguem alguns exemplos de gigantes de TI que utilizam o wordpress como CMS.<br>- <a href="http://www.smashingmagazine.com/" rel="nofollow">http://www.smashingmagazine.co...</a><br>- <a href="http://net.tutsplus.com/" rel="nofollow">http://net.tutsplus.com/</a></p><p>E o Abduzeedo do brasileiro Fábio Sasso usa Drupal que também é constantemente recomendado apesar de nunca ter utilizado.<br>- <a href="http://abduzeedo.com/" rel="nofollow">http://abduzeedo.com/</a></p>

- author: Fred
  date: 2013-08-22T02:41:18
  text: |
    <p>Cara tenho uma dúvida, ao seu ponto de vista o Jekyll é recomendado para um portal?</p><p>E quais outras tecnologias você recomenda que faça os includes em html?</p><p>Abraço e parabéns pelo site.</p>

- author: João Pedro Nascimento
  date: 2013-08-19T18:25:01
  text: |
    <p>Muito bom Leandro, vejo varias pessoas mudando pro JEKYLL , ele está separado aqui para estudos futuros  rsrs muito bacana seu novo portfólio parabéns !</p>


---
 
Sempre que estou atolado de coisas para fazer e sem tempo para dormir refaço o portfólio para me lembrar que poderia ser pior. Se estiver realmente muito lotado, paro tudo e estudo um pouco de fotografia. No final das contas tudo se resolve bem.

<!--more-->

Na verdade abandonei um pouco a cara de portfólio, já que pretendo aposentar os freelas (convencionais) e foquei em montar um blog. O código fonte, obviamente é aberto e está disponível nesse [repositório](https://github.com/leandrooriente/leandrooriente).<br />
A ideia é pegar mais projetos de start-ups ou projetos próprios e menos clientes empresariais.

Caindo pra parte técnica. Usei [Jekyll](http://jekyllrb.com/) no lugar de [Wordpress](http://wordpress.org). Fiz isso porque achei ele mais enxuto para o tipo de site que pretendo manter.<br /> O Wordpress oferece recursos demais e é pesadão para o pouco que pretendo postar. Além disso achei a solução do Jekyll mais elegante.

O Jekyll serve arquivos estáticos. Todas as páginas são HTML's puros gerados no build. Então a resposta do servidor é absurdamente rápida. Combine isso com Gzip e unificação de JS's e CSS's e o site parece rodar localmente =).

Na infra do site estou usando Ubuntu 12.04 e o servidor é Nginx. Optei pelo Nginx no lugar do clássico Apache porque li num post de fonte duvidosa que ele era mais rápido e performático e resolvi não pesquisar mais a respeito e tomar como verdade.<br />
Até agora tem se comportado bem.

O servidor é provido pela [DigitalOcean](http://digitalocean.com). Aliás gostaria aqui de recomendar os serviços deles. A empresa oferece um serviço fora de série pelo preço que cobra (5 doletas/mês por uma VPS totalmente configurável com dezenas de OS disponíveis).

Pretendo escrever sobre meu cotidiano e soluções usadas nas aplicações em que trabalho aqui na [Vtex](http://www.vtex.com.br/) e alguns pitacos sobre a vida e meu novo hobby, a fotografia.

Aliás, aproveitando a deixa, se você é carioca, manja dos front-end development e está a procura de uma empresa irada para trabalhar não deixe de entrar em contato ~> [leandro.oriente@vtex.com.br](mailto:leandro.oriente@vtex.com.br).

Tive algumas dificuldades iniciais para trabalhar com Jekyll já que ele é desenvolvido em Ruby e não tenho muitos conhecimentos na área, mas depois de algumas horinhas no google consegui resolver boa parte deles.<br />
 Caso tenha alguma dúvida a respeito poste aqui nos comentários. As vezes é um problema que já precisei resolver.
