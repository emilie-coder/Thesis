import React from 'react'
import myStyle from './Home.module.css'


const Home = () => {
  return (
    <div className={myStyle.homePage}>
      <div className={myStyle.intro}>
        <div className={myStyle.titleLetters}>
          <h1 className={myStyle.titleLetter}>
            E
          </h1>
          <h1 className={myStyle.titleLetter}>
            V
          </h1>
          <h1 className={myStyle.titleLetter}>
            R
          </h1>
          <h1 className={myStyle.titleLetter}>
            O
          </h1>
        </div>
        <div className={myStyle.subTitle}>
        Linking your 2D art into the VR world
        </div>
      </div>

      <div className={myStyle.gettingStarted}>
        <div className={myStyle.startedTitle}>
          Getting Started:
        </div>


        <div className={myStyle.step}>
          <div className={myStyle.number}>
            1
          </div>
          <div className={myStyle.stepInfo}>
            <div className={myStyle.stepTitle}>
              Create
            </div>
            <div className={myStyle.subTitle}>
              Create your 2D art in your preffered platform
            </div>
          </div>
        </div>

        <div className={myStyle.step}>
          <div className={myStyle.number}>
            2
          </div>
          <div className={myStyle.stepInfo}>
            <div className={myStyle.stepTitle}>
              Design
            </div>
            <div className={myStyle.subTitle}>
              Design your VR space by uplaoding your art into EVRO
            </div>
          </div>
        </div>


        <div className={myStyle.step}>
          <div className={myStyle.number}>
            3
          </div>
          <div className={myStyle.stepInfo}>
            <div className={myStyle.stepTitle}>
              Experience
            </div>
            <div className={myStyle.subTitle}>
              Experience your art immersively in your VR headset
            </div>
          </div>
        </div>



      </div>
    </div>
  )
}

export default Home