```javascript
let data = {
    // TODO: insert your data structure that contains 
    // users + quizzes here
    users: [
    {
      userId: 1,
      nameFirst: 'Hayden',
      nameLast: 'Smith',
      email: 'hayden.smith@unsw.edu.au',
      password: '12345',
      prevpassword: [],
      
      numSuccessfulLogins: 3,
      numFailedPasswordsSinceLastLogin: 1,
      quizzes: [2],
    },
    {
      userId: 2,
      nameFirst: 'Rani',
      nameLast: 'Jiang',
      email: 'ranivorous@gmail.com',
      password: 'abcde',
      prevpassword:[],
      numSuccessfulLogins: 2,
      numFailedPasswordsSinceLastLogin: 6,
      quizzes: [1]
    },
  ],

  quizzes: [
    {
      quizId: 1,
      name: 'My Quiz',
      timeCreated: 1683125870,
      timeLastEdited: 1683125871,
      description: 'This is my quiz',
    },
    {
      quizId: 2,
      name: 'Another Quiz',
      timeCreated: 1683125873,
      timeLastEdited: 1683125875,
      description: 'This is my best quiz',
    },
  ],
};
```

[Optional] short description: 
The data structure consists of an object for users with relevant properties. More properties can be added/removed.
The similar object is made for quizzes in which relevant quiz information can be stored.
