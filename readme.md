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
update peers section to following:
    -add visual status of connection
    -add request new peers button
update main page:
    -add button to go to input link section
add input link section
    -basic form - saves data to local storage
    -sends notice of new content to network
clean up peer fill algorithm:
    - make it faster/balanced load;
add tests
    -tests for correctness
    -tests for security from bad actors
general clean up
    -just make it better
```


