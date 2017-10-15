//These need to be thier own classe
var anims = {
  "bounce":[
    {
      time:75,
      ease:'>',
      delay:0,
      effects:[
        {
          type:"transform",
          value:{scale:1.6}
        }
      ]
    },
    {
      time:200,
      ease:'<',
      delay:0,
      effects:[
        {
          type:"transform",
          value:{scale:0.8}
        }
      ]
    },
    {
      time:100,
      ease:'<',
      delay:0,
      effects:[
        {
          type:"transform",
          value:{scale:1}
        }
      ]
    }
  ],
  "spin":[
    {
      time:400,
      ease:'-',
      delay:0,
      effects:[{
        type:"rotate",
        value:180
        },
        {
          type:"transform",
          value:{scale:1.2}
        }
      ]
    },{
      time:400,
      ease:'-',
      delay:0,
      effects:[{
        type:"rotate",
        value:0
        },
        {
          type:"transform",
          value:{scale:1}
        }
      ]
    }
  ]
};
