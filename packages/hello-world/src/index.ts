type Message = "hello world";
interface Hello {
  hello(): Message;
}

export class HelloWorld implements Hello {
  hello(): Message {
    return "hello world";
  }
}
