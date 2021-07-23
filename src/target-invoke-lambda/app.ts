const handler  = async (event: any) => {
  console.log('event is ', event);

  throw new Error('bad invoke');
}

exports.handler = handler;
handler({"test": "test"});
