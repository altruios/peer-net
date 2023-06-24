# peer-net

## a p2p network link sharing app;

## premise:
Information spreads based on how popular it is.

The feed you have is based on your random (or specific) peer network.

Each peer sorts posts into keep and discard piles.

Kept posts propagate through the network, discarded posts do not.

The more peers that have the same posts: the higher it rises in your feed.

Ephemeral, without comments, or users, just posts)


## this is a work in progress

### status: basic demo, not out of the box.
#### how to start demo

>1. make an .env file with the following variables.
>```
>VITE_PEER0=
>VITE_PEERID=
>//Assumes prefix of 'peer-'
>//peer0 is the boot address,
>//peerid is the node's id
>//when these two variables are the same, the node is a boot node
>```
>2. make a few instances of the peer-net clients
>```
>//run the following commands each in seprate terminal, todo: make a script/docker to do this
>VITE_PEERID="peer-${some_arbitray_string}" npm run dev
>```
>3. populate with data:
>```
>a post is all you can share or avoid on peer-net, you can make a post via the gui.
>//todo: populate data via json
>//todo:consider idea of bulk updates, and filtering out such updates on client side
>
>//post structure
>{
>title:string,
>text:string,
>link:string,
>image:string
>//todo: tags,timestamp,
>}
>
>```
>4. help find bugs / help test
>```
>//the more eyes the better,
>//this is not finished,
>//it can be finished faster with your help
>```

## todo:
```
mobile support:
    - android should work, but iphone will mever be able to access webpage
    - iphone app development specs/standards:
        -iphone app.
desktop app:
    -clean up for deployment:
        -see projects for details
    - electron package
    - build file for AUR


clean up peer fill algorithm:
    - make it faster/balanced load;
    - test on non-trival network
feed search algorithm:
    - via tags, pass query effeciently through the network.
        options:
            - mass tag list stored on greped from posts each request or stored on post score update
            - flood fill filtered by search params?
add tests
    -tests for correctness
    -tests for security from bad actors
```


