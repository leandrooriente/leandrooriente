title: Criando sites estáticos extremamente performáticos
author: Leandro Oriente
lang: pt-BR
date: 2016-08-23 22:18:30
description: Como chegar ao máximo de performance usando static generators e NGINX
thumbnail: /images/webperformance-thumb.png
---
Faz tanto tempo que não escrevo aqui no blog que nem sei por onde começar. Então resolvi começar explicando que não sei por onde começar. Me pareceu uma boa introdução.

Antes de voltar a postar, resolvi dar uma geral no site, até porque o Jekyll (gerador de estáticos que usava) subiu o major para a versão 3 e obviamente me quebrou completamente.

Pesquisei mais sobre o Jekyll e geradores de sites estáticos para ver o que tinha de novidade e acabei me deparando com uma dúzia de serviços novos.

Optei pelo Hexo por ser desenvolvido com JavaScript. Tinha alguns problemas quando precisava de algo mais profundo no Jekyll porque não tenho muita familiaridade com Ruby.

Antes de continuar, vamos aos números porque sou ansioso e não quero esperar até o final do post para cita-los.

**Cenário**

- Conexão: 1,5mbps (fazendo throttling no Chrome)
- Post: [Como me tornar um desenvolvedor Front End](https://leandrooriente.com/como-me-tornar-um-desenvolvedor-front-end/)

**Resultados**

- Home sem cache: ~ 650ms load, 500ms first view
- Home com cache: ~ 550ms load, 440ms first view
- Post sem cache: ~ 1,8s load, 1s first view
- Post com cache: ~ 1,2s load, 460ms first view

Obs: Existem algumas camadas de cache do Disqus, Google Analytics e DNS que fogem do meu controle. É provavel que esses números variem um pouco de acordo com o usuário, seu device e sua posição geográfica, mas serviu como base para validar se as coisas estavam indo bem ou mal a cada ajuste.

A partir daqui vou separar o post em duas partes: otimizações client site e server side.

## Otimizações client side

A primeira coisa que fiz foi olhar o site e analisar o que realmente importava para o usuário. Tive muita empatia nesse ponto e prestei atenção em quais dados eram realmente relevantes nos posts que acessava.

Seguindo esse *mindset* cheguei a algumas conclusões:

- **Imagem de destaque:** O usuário não se importa com a imagem decorativa da chamada do seu post. Se ela não agrega nenhum valor e está ali simplesmente por firula, remova. Geralmente pesam por baixo uns 100kb e não trazem nenhum valor. O jQuery gzipado pesa uns 80kb, então pensem muito nas imagens.

- **Newsletter:** Tinha uma chamada para cadastro de newsletter, mas não tenho tempo para escrever posts, imagina enviar emails? Adeus Mailchimp.

- **Social Widgets:** Não lembro quando foi a última vez que compartilhei um post usando um widget desses. Se gosto do post, copio a URL e compartilho onde quer que seja. No último ano, por exemplo, compartilhei muito mais conteúdo no Slack e no Whatsapp do que em redes sociais propriamente ditas. Removi todos.

- **Minificação dos assets:** Depois de duas palestras por mês sobre performance nos últímos 5 anos todo mundo sabe que tem que minificar o CSS, JS, HTML e imagens né?

- **Concatenação dos arquivos:** Sprites, main.min.js, libs.min.js? Não. Tocarei com carinho nesse assunto quando falar de HTTP/2

- **HTML otimizado:** Aqui entra uma regra de ouro. Evite poluir o seu DOM. Pense semânticamente em cada elemento que insere no HTML. Quanto menos elementos desnecessários mais rápido para baixar e menos processamento necessário para o seu usuário. Nem todo mundo tem um iPhone 6s no bolso. Pense na galera do Moto E.

- **Ícones:** Usei poucos ícones então resolvi economizar no FontAwesome também. Peguei os 3 que precisava em SVG e adicionei no site.

- **Frameworks:** Não vi necessidade, não usei. Meu CSS ficou com 2.3kb e consegui o resultado que queria. Obviamente meu escopo é mega limitado. Uma lista e uma página de texto, mas sempre pense se realmente precisa de um framework e caso precise, se precisa dele inteiro.

- **Fontes:** Assunto polêmico. Vai ficar pequeno pra essa lista então vamos ao próximo parágrafo.

A equipe de Design da VTEX pirava comigo (pirava porque sai de lá, mas é assunto pra outro post). Sou um teste de acessibilidade ambulante. Tenho um problema grave de córnea e daltonismo (grau baixo, sei qual semáforo é o vermelho e não uso amarelo com azul) então se eu conseguisse ler bem e entender a mensagem que queriam passar era porque estava tudo ok.

Por conta disso sempre valorizei boas interfaces para leitura. Bati palmas de pé e chorando quando o Medium foi lançado. Era essa a experiência de leitura que a internet precisava e ninguém entregava. Muitos sites evoluiram sua tipografia e atenção à formatação do conteúdo depois que o Medium chegou com uma voadora de dois pés na web.  

Então esse era um ponto que não podia pecar. Se eu não passasse no meu teste de acessibilidade era sinal de que o site estava ruim.

E chegou o momento da fanfarronice. Entro no Google Fonts como se fosse um Walmart e vou selecionando. Proxima Nova, me vê uma 400, 500 e 700. Ah, não esqueça do itálico. Quero uma Arvo também, mas essa pode ser só bold porque vou usar nos títulos, hum... desce itálico também porque vai que quero ser irônico né?

O Google Fonts já deu a deixa. Avisou que vai ficar lento, mas cara, não tem como criar sites usando Arial e Times New Roman. Bota 250kb pra dentro e vida que segue.  

Não me pareceu bom. Estava economizando 80kb de jQuery aqui, 60kb de framework lá, 100kb de imagem ali, mas jogando 250kb de fontes no site cujo conteúdo em si pesa uns 4kb?

Algumas horas de pesquisa até achar [um post](https://www.smashingmagazine.com/2015/11/using-system-ui-fonts-practical-guide/) que diz o óbvio. Use a fonte que o device do seu usuário utiliza! Ele já passa o dia todo lendo as interfaces com essa fonte. Seja num Mac, no Windows, no Android, IOS, torradeira, ele já tem um padrão de fontes que está acostumado a ler.

Bastava achar os principais OS e usar suas fontes. Fiz o teste, olhei no Mac OS, olhei no IOS, olhei no Android, me pareceu bom. Pronto, formatação descente sem um 1kb a mais por isso.

Quer experiência mais deprimente que acessar um site, ver ele carregar inteirinho e ficar olhando aquele clarão na área do conteúdo porque a bendita fonte ainda não veio? Me entrega o site em HTML puro, mas não me faz esperar a única coisa que realmente importa.

Funcionou pra mim. Não sou a Globo.com, nem a Coca Cola. É óbvio que não são todos os casos em que você pode se dar ao luxo de não usar determinada fonte. Mas, esteja aberto a novas experiências 😏.

Fim do primeiro tempo. Resumo geral. Minha home ficou com 16kb contando com o Google Analytics que pesa 11kb (alô google, vamos enxugar isso ai).

## Otimizações server side

Certo, o site já tinha tudo para carregar rápido. Estou usando o Hexo, então basicamente o que tenho no final das contas são pastas e arquivos estáticos. Se jogasse no UOL Host já ia entregar numa velocidade descente (eu acho), não precisa processar nada, só entregar o arquivo.

Mas eu precisava ir além. *We need to go deeper*.

Uso Digital Ocean tem alguns anos e sempre fiz o básico lá. Peguei um tutorial do NGINX para Ubuntu e coloquei o site no ar. E assim permaneceu por uns bons 3 ou 4 anos.

Só que comecei a lidar um pouco com infra na VTEX, a ler mais a respeito e vi que podia otimizar o meu site. Melhorei praticamente tudo que podia otimizar sem gastar mais do que o custo do próprio server.

### HTTP/2

Uma das regras de ouro para performance web era minificar e concatenar de forma inteligente tudo o que você pudesse para reduzir a quantidade de requests do browser.

No HTTP 1.1 o browser enfilera os seus requests até determinado ponto e depois vai entregando conforme a fila vai esvaziando. Abra a aba de network do Chrome e carreguem o site da [Casa & Vídeo](http://www.casaevideo.com.br/webapp/wcs/stores/servlet/pt/auroraesite) por exemplo. Analisem como os requests se comportam.

Se você lida com uma aplicação grande é fácil chegar nos 60, 80 requests por página. E nesse ponto a infra começa a ficar cara. Ai entram os Sprites de imagem, arquivos gigantes concatenados, CDN's e etc. para tentar amenizar esse problema.

No HTTP/2 a magia é outra. Resumidamente, ele cria uma conexão única e transfere uma tonelada de arquivos simultâneamente. Isso fica restrito a cada host obviamente o que de certa forma, remove uma dos maiores benefícios de usar uma CDN, ampliar os requests simultâneos. Se você usava uma CDN somente para isso, pode cancelar e economizar seu dinheiro.

Porém nem tudo são flores e para utilizar o HTTP/2 você precisa que seu site tráfegue apenas com SSL (https). E um certificado SSL não é a coisa mais barata do mundo.

Eis que surge a iniciativa [Let's Encrypt](https://letsencrypt.org/) que permite que você gere certificados SSL válidos de graça. Site seguro, rápido e de graça. 

**Duas observações:**

- O Google mudou o protocolo de *handshaking* (processo que valida se as duas pontas estão realmente seguras) para ALPN e essa tecnologia depende do OpenSSL 1.02. Isso quebrou o HTTP/2 de metade da web já que quase ninguém usava essa versão do OpenSSL. Só saiu no Ubuntu na versão 16.04 (abril de 2016), por exemplo. Então se você habilitou o HTTP/2 há alguns meses atrás da uma conferida pra ver se não quebrou no Chrome.

- Colocar o site inteiro para responder apenas em HTTPS é bacana em alguns pontos. O Google te dá mais relevância, você torna a navegação do seu usuário mais segura, mas você perde um tempo adicional na validação do certificado. Isso precisa ser levado em conta quando analisamos a performance do site.

### Cache

Você não altera o seu CSS ou as imagens do seu site a cada segundo correto? Então pode se dar ao luxo de colocar um tempo limite de cache. Isso permite que o seu usuário não carregue o mesmo recurso duas vezes enquanto navega no seu site ou quando retornar no dia seguinte.

Eu optei por colocar um cache *infinito* (2 anos) e trabalhar a expiração dele pela versão. Toda vez que faço um deploy eu adiciono a data *(YYYYMMDDHHmm)* com precisão de minutos numa querystring no nome do arquivo. Isso força o browser a carregar a nova versão.

Para o browser *cachorro.png* é um arquivo diferente de *cachorro.png?v=2*. O que faz total sentido já que em alguns casos a querystring faz parte de um processo para que a imagem ou arquivo seja gerado. Quem nunca viu um *batata.jpg?width=200&height=200&quality=medium*?

### Gzip

Sim.

Ahhh, mas não precisa habilitar para imagens não. Só para HTML, CSS e JS. Em tese você já otimizou o suficiente as suas imagens e a compactação do Gzip não faria diferença nenhuma. Só aumentaria o tempo do  servidor para compactar e do browser para descompactar.

## O que falta otimizar

- Servir as imagens dos posts em tamanhos diferentes para devices diferentes. Já faz tempo que os browsers suportam nativamente isso, mas falta tempo para criar um processo que automatize esse processo.

- Adicionar um processo de minificação de imagens mais eficiente (a comunidade do Hexo anda meio paradona, mas to futicando aqui).

- Achar algum host decente no Brasil. A Digital Ocean é um amor, mas perco muito tempo por conta da latência. Brasil x USA não é tão perto assim. É de longe meu maior gargalo hoje.

E a gente fica por aqui. São otimizações simples, mas se você trabalha em agência ou tem alguns clientes onde um gerador de estáticos resolveria da para otimizar bem o carregamento com essas dicas.

Também tive resultados interessantes com dois sites em Wordpress nesse mesmo servidor usando NGINX em conjunto com o plugin [W3 Total Cache](https://www.w3-edge.com/products/w3-total-cache/).