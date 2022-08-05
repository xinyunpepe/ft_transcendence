Ref: 
  - nestjs
  https://www.youtube.com/watch?v=wqhNoDE6pb4
  https://wanago.io/2021/03/08/api-nestjs-two-factor-authentication/
  
  - docker
  https://docs.docker.com/compose/compose-file/compose-file-v3/
  https://nodejs.org/fr/docs/guides/nodejs-docker-webapp/

Game Invitation Protocol:
  When inviter sends an invitation
  this.socket.emit('GameSendInvitation', [inviterId, competitionTypeHash, gameCustomizationHash] );
  
  When invitee accepts the invitation
  this.socket.emit('GameAcceptInvitation', [inviteeId] );
  
  Both need to subscribe from response
  this.socket.fromEvent('GameInvitationResponse');
  'Accepted' / 'Refused'
  
  Accepted: Redirect to game component
  
  Refused: Do nothing
  
  problem: response will only send to original client sockets, could be a problem     after refreshing the page or changing component
  

History Database Protocol:
  get<HistoryI>(`${environment.baseUrl}/history/${ id }`)
  if invalid id : return null
