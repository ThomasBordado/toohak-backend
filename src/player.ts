import { EmptyObject, getPlayerResultReturn, messageInput, messages } from "./interfaces"

export const getPlayerResult = (playerId: number): getPlayerResultReturn => {
    return { usersRankedByScore: [
        {
          name: "Hayden",
          score: 45
        }
      ],
      questionResults: [
        {
          questionId: 5546,
          playersCorrectList: [
            "Hayden"
          ],
          averageAnswerTime: 45,
          percentCorrect: 54
        }
      ]
    }
}

export const getSessionMessages = (playerId: number): messages => {
    return {  messages: [
        {
          messageBody: "This is a message body",
          playerId: 5546,
          playerName: "Yuchao Jiang",
          timeSent: 1683019484
        }
      ] 
    }
}

export const sendSessionMessage = (playerId: number, message: messageInput): EmptyObject => {
    return { };
}