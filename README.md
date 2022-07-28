Ref: 
  - nestjs
  https://www.youtube.com/watch?v=wqhNoDE6pb4
  https://wanago.io/2021/03/08/api-nestjs-two-factor-authentication/
  
  - docker
  https://docs.docker.com/compose/compose-file/compose-file-v3/
  https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/

Game Invitation Protocol:
  this.socket.emit('GameInvitation', [id0, id1] );

  this.socket.fromEvent('GameInvitationResponse');
  'Accepted' / 'Refused'
  A: Redirect to game component
  R: Do nothing
  

History Database Protocol:
  get<HistoryI>(`${environment.baseUrl}/history/${ id }`)
  if invalid id : return null
