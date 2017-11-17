import React, { Component } from 'react'
import OnboardingWelcome from './OnboardingWelcome'
import OnboardingSocialConnectors from './OnboardingSocialConnectors'
import OnboardingInterests from './OnboardingInterests'
import Dialog from 'material-ui/Dialog'
import Button from '../../common/Button'

class OnboardingWizard extends Component {
  state = {
    // you're changing this in the backend anyway so you can assign it to a prop in render
    onboardingState: this.props.currentUser.currentUser.onboardingState,

    // don't set the onboardingStates in state. Set them as a const ouside of the class
    onboardingStates: ['CONFIRM', 'SOCIAL', 'INTERESTS', 'COMPLETE'],

    // You can make sure this whole component is only rendered when it needs to be by setting a condition in App.js where the component is rendered
    onboardingDialogOpen: true,

    // you can just define this in render as well
    allInterests: this.props.listenInterests.allListenInterests
      ? this.props.listenInterests.allListenInterests.nodes : [],

    //of all the crap which you put in here this is the only state which you need in this component.
    selectedInterests: [],

    //you can put the conditions for this straigt in the `disabled` prop of the button
    buttonDisabled: true
  }

  disableButton = () => {
    this.setState({ buttonDisabled: !this.state.buttonDisabled })
  }

  //you can call this function on componentWillMount.
  updateUserOnboardingState = (updatedState) => {
  // Also you can just set a condition in the dialog `open` prop like this: open={onboardingState !== 'COMPLETE'} instead of using an `if` statement here
    if (updatedState === 'COMPLETE') {
      this.setState({ onboardingDialogOpen: false })
    }
    // if you're updating the state in the backend then you can access the state as a prop anyway. You don't have to set a state in React as well
    this.setState({ onboardingState: updatedState })
    this.props.updateUserOnboardingState({
      variables: {
        input: {
          onboardingState: updatedState
        }
      }
    })
  }
  updateUserInterests = () => {
    let interestIdsArr = []
    this.state.selectedInterests.map((interestIds) => {
      interestIdsArr.push(interestIds.id)
    })
    this.props.addUserListenInterests({
      variables: {
        input: {
          interestIds: interestIdsArr
        }
      }
    })
  }

  render () {
    const {
      onboardingStates,
      onboardingState,
      onboardingDialogOpen,
      selectedInterests,
      allInterests,
      buttonDisabled
    } = this.state
    const { currentUser, currentOrganisation } = this.props
    return (
      <Dialog
        open={onboardingDialogOpen}
        autoScrollBodyContent={true}
        contentClassName='dialog-content-container__onboarding'
        paperClassName='dialog-content__onboarding'
        >
        {onboardingState === 'CONFIRM' &&
        <OnboardingWelcome {...this.props} />}
        {onboardingState === 'SOCIAL' &&
        <OnboardingSocialConnectors
          handleSocialConnectorModal={this.handleSocialConnectorModal}
          currentUser={this.props.currentUser}
          currentOrganisation={this.props.currentOrganisation}
          {...this.props}
          />
        }
        {onboardingState === 'INTERESTS' &&
        <OnboardingInterests
          handleSlectionModal={this.handleSlectionModal}
          currentUser={currentUser}
          currentOrganisation={currentOrganisation}
          {...this.props}
          allInterests={allInterests}
          selectedInterests={selectedInterests}
          disableButton={this.disableButton}
          />
        }
        <div className='dialog-content__button-container'>
          <Button
            customClass='button button--primary'
            label={'Back'}
            disabled={this.state.onboardingState === 'CONFIRM' && selectedInterests.length === 0}
            onClick={() => {
              onboardingStates.map((currentState, i) => {
                if (onboardingState === currentState) {
                  this.updateUserOnboardingState(onboardingStates[i - 1])
                }
                if (onboardingState === 'INTERESTS') {
                  this.updateUserInterests()
                }
              })
            }
          }
          />
          <Button
            customClass='button button--primary'
            label={this.state.onboardingState === 'INTERESTS' ? 'Finish' : 'Next'}
            disabled={buttonDisabled}
            onClick={() => {
              onboardingStates.map((currentState, i) => {
                if (onboardingState === currentState) {
                  this.updateUserOnboardingState(onboardingStates[i + 1])
                  if (onboardingState === 'INTERESTS') {
                    this.updateUserInterests()
                  }
                }
              })
            }
            }
            />
        </div>
      </Dialog>
    )
  }
}

export default OnboardingWizard
// disbales button on interest state:
// onboardingState === 'INTERESTS' && interestId.length === 0
