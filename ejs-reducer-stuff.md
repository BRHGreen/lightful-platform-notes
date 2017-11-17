Ej’s reducer stuff

const comments = [{id: "hello", inReplyTo: null }, {id: "2", inReplyTo: "hello"  }]

const lol = comments.reduce((current, next) => {
  if (!next.inReplyTo) {
    current.push(next)
  } else {
    const parentCommentOfReply = current.find(parentComment => parentComment.id === next.inReplyTo)
    parentCommentOfReply['replies'] ? parentCommentOfReply['replies'].push(next) : parentCommentOfReply['replies'] = []
    parentCommentOfReply['replies'] ? parentCommentOfReply['replies'].push(next) : parentCommentOfReply['replies'] = []
  }
  return current
}, [])

console.log(JSON.stringify(lol))
