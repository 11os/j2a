import React from 'react'
import { json2ts } from '../utils/json2ts'
import { LoopInfo, ParamInfo } from '../entity/ClazzInfo'
import { AstNode } from '@j2a/core/dist/index'

interface ClazzProps {
  result?: string
  ast?: AstNode
  clazzName: string
}
const ClazzItem: React.FC<ClazzProps> = ({ result, ast, clazzName }) => {
  try {
    const { params, loop }: { params: ParamInfo[], loop: LoopInfo[] } = json2ts({ result, ast })
    return params ? <>
      {/* class */}
      <div><span className="pink">export</span> <span className="blue"> interface </span><span className="green">{clazzName || 'Response'}</span> <span className="white">{`{`}</span></div>
      {/* params */}
      {params.map((ele: ParamInfo, idx: number) => <div key={ele.key + idx} >  <span className="blue">{ele.key}</span>: <span className="green">{ele.type}</span>;{ele.comment && <span className="red"> // {ele.comment}</span>}</div>)}
      {/* define */}
      <span className="white">{"}"}</span>
      <br />
      {loop && loop.map((ele: LoopInfo, index: number) => <ClazzItem key={index} ast={ele.node} clazzName={ele.clazz} />)}
      <style jsx>{`
        .pink {
          color: rgb(197, 134, 192);
        }
        .green {
          color: #4ec9b0;
        }
        .blue {
          color: #9cdcfe;
        }
        .yellow {
          color: #dcdcaa;
        }
        .red {
          color: #f84f4f;
        }
        .white {
          color: white;
        }
        .align-right {
          margin-top: 10px;
          text-align: right;
        }
      `}</style>
    </> : null
  } catch ({ message, location }) {
    return <div>{message} {location && JSON.stringify(location.start)}</div>
  }
}

export default ClazzItem;