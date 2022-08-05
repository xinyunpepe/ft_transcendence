Ref: 
  - nestjs
  https://www.youtube.com/watch?v=wqhNoDE6pb4
  https://wanago.io/2021/03/08/api-nestjs-two-factor-authentication/
  
  - docker
  https://docs.docker.com/compose/compose-file/compose-file-v3/
  https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/

Game Invitation Protocol:

  When chat sockets are created, need to 
  1. send to server ```this.socket.emit('ChatConnect', userId);```
  2. subscribe from event ```this.socket.fromEvent('GameInvitationResponse');```
  
  When they're destroyed, need to 
  1. send to server ```this.socket.emit('ChatDisconnect, userId');```
  2. unsubscribe the previous subscription

  When two people are matched ( the invitee accepts the invitation )
  send to server ```this.socket.emit('GameInvitation', [id0, id1, competitionTypeHash, GameCustomizationHash] );```

  The response from event ```'GameInvitationResponse'``` would be
  
  ```'Accepted'``` or ```'Refused'```
  
  ```'Accepted'```: Redirect to game component
  
  ```'Refused'```: Do nothing
  

History Database Protocol:
  get<HistoryI>(`${environment.baseUrl}/history/${ id }`)
  if invalid id : return null
