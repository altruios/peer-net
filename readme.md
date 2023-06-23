# peer-net

## a p2p link sharing app;

## premise:
information spreads based on how sticky it is.
the feed you have is based on your random peer network.
each peer sorts links into keep and discard.
each peer can search through other peer's keep and discard pile.
the more peers that have the same link: the higher it rises in your feed.
ephemeral, without comments, or users, just links)


## this is a work in progress

### status: basic demo, not out of the box.
#### how to start demo
##### you need a boot node:
###### make two instances of the client
```
// run this for each instance (set the ports so they don't collide)
npm run dev
```
###### set the boot client to a known boot id 
###### point VITE_PEER0 in the .env (of the not-boot-node client) at the boot client.
##### populate with data:
in addition, to see any sort of feed you must populate it with data, this can be done with an array of objects {title,text,link,image} (all string properties, link and image are urls);

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
add tests
    -tests for correctness
    -tests for security from bad actors
```


