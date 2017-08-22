import React, { Component } from 'react'
import '../../styles/onboardingWizard.scss'
import '../../styles/page.scss'
import { Row, Col } from 'react-flexbox-grid'

class OnboardingInterests extends Component {

  state = {
    error: ''
  }

  handleSelectedInterest (interest, i) {
    console.log('this: ', this);
    const { selectedInterests, allInterests, disableButton } = this.props
    let indexName = allInterests.indexOf(interest)
    interest.key = i
    if (selectedInterests.length >= 2) {
      this.setState({ error: 'too many interests, brah.' })
    } else {
      selectedInterests.push(interest)
      this.setState({ selectedInterests: selectedInterests })
      console.log('selectedInterests: ', selectedInterests.length);
      if (selectedInterests.length === 1) {
        disableButton()
      }
      if (indexName > -1) {
        allInterests.splice(indexName, 1)
        this.setState({ allInterests: allInterests })
      }
    }
  }
  handleRemoveInterest (interest) {
    const { selectedInterests, allInterests, disableButton } = this.props
    let indexName = selectedInterests.indexOf(interest)
    if (this.state.error !== '') {
      this.setState({ error: '' })
    }
    if (indexName > -1) {
      selectedInterests.splice(indexName, 1)
      this.setState({ selectedInterests: selectedInterests })
      if (selectedInterests.length === 0) {
        disableButton()
      }
    }
    allInterests.splice(interest.key, 0, interest)
    this.setState({ allInterests: allInterests })
  }
  render () {
    return (
      <div className='dialog-content dialog-content__onboarding-interests'>
        <p>Here you can choose topics from which you would like to recieve news feeds and updates. </p>
        <p className='onboarding__error-message'>{this.state.error}</p>
        <Row>
          <Col sm={6} >
            <h3>Choose up to two topics:</h3>
            <ul className='onboarding-interests'>
              {this.props.allInterests.map((interest, i) =>
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
