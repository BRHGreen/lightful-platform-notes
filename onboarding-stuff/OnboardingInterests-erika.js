import React, { Component } from 'react'
import '../../styles/onboardingWizard.scss'
import '../../styles/page.scss'
import { Row, Col } from 'react-flexbox-grid'

class OnboardingInterests extends Component {
  state = {
    error: ''
  }

  handleSelectedInterest = (interest, i) => {
    const { selectedInterests } = this.props
    interest.key = i
    if (selectedInterests.length >= 2) {
      this.setState({ error: 'too many interests, brah.' })
    } else {
      this.props.updateSelectedInterests([...selectedInterests, interest])
    }
  }

  handleRemoveInterest = (interest) => {
    const { selectedInterests } = this.props
    if (this.state.error !== '') {
      this.setState({ error: '' })
    }
    if (selectedInterests.indexOf(interest) !== -1) {
      this.props.updateSelectedInterests(selectedInterests.filter(e => e.interest !== interest.interest))
    }
  }

  render () {
    const { allInterests, selectedInterests } = this.props
    const unselectedInterests = allInterests.filter(e => selectedInterests.indexOf(e) === -1)
    return (
      <div className='dialog-content dialog-content__onboarding-interests'>
        <p>Here you can choose topics from which you would like to recieve news feeds and updates. </p>
        <p className='onboarding__error-message'>{this.state.error}</p>
        <Row>
          <Col sm={6} >
            <h3>Choose up to two topics:</h3>
            <ul className='onboarding-interests'>
              {unselectedInterests.map((interest, i) =>
                <li
                  key={i}
                  onClick={() => this.handleSelectedInterest(interest, i)}
                  >
                  {interest.interest}
                </li>
              )}
            </ul>
          </Col>
          <Col sm={6} >
            <h3>Choosen topics:</h3>
            <ul className='onboarding-interests onboarding-interests--selected'>
              {this.props.selectedInterests.map((interest, i) =>
                <li
                  key={i}
                  onClick={() => this.handleRemoveInterest(interest)}
                  >{interest.interest}
                </li>
              )}
            </ul>
          </Col>
        </Row>

        </div>
    )
  }
}

export default OnboardingInterests
