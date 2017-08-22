import React, { Component } from 'react'
import OnboardingWelcome from './OnboardingWelcome'
import OnboardingSocialConnectors from './OnboardingSocialConnectors'
import OnboardingInterests from './OnboardingInterests'
import Dialog from 'material-ui/Dialog'
import Button from '../../common/Button'

const onboardingStates = ['CONFIRM', 'SOCIAL', 'INTERESTS', 'COMPLETE']
class OnboardingWizard extends Component {
  state = {
    selectedInterests: []
  }

  componentDidMount () {
    this.updateUserOnboardingState('CONFIRM')
  }

  updateUserOnboardingState = (updatedState) => {
    this.props.updateUserOnboardingState({
      variables: {
        input: {
          onboardingState: updatedState
        }
      }
    })
  }

  updateSelectedInterests = (interests) => {
    this.setState({selectedInterests: interests})
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
    const { selectedInterests } = this.state
    const { currentUser, currentOrganisation } = this.props

    // it's better to reference the props already coming from the apollo store
    // rather then saving in state as well as,
    // otherwise, react needs to calculate that stuff twice
    const allInterests = this.props.listenInterests.allListenInterests
      ? this.props.listenInterests.allListenInterests.nodes
      : []
    const onboardingState = currentUser.currentUser && currentUser.currentUser.onboardingState
    const userIdentities = currentUser.currentUser && currentUser.currentUser.socialIdentitiesByUserId.nodes.length
    return (
      <Dialog
        open={onboardingState !== 'COMPLETE'}
        autoScrollBodyContent={true}
        contentClassName='dialog-content-container__onboarding'
        paperClassName='dialog-content__onboarding'
        >
        {onboardingState === 'CONFIRM' &&
          <OnboardingWelcome {...this.props} />
        }
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
            updateSelectedInterests={this.updateSelectedInterests}
            selectedInterests={selectedInterests}
            disableButton={this.disableButton}
          />
        }
        <div className='dialog-content__button-container'>
          <Button
            customClass='button button--primary'
            label={'Back'}
            onClick={() => {
              onboardingStates.map((currentState, i) => {
                if (onboardingState === currentState) {
                  this.updateUserOnboardingState(onboardingStates[i - 1])
                }
                if (onboardingState === 'INTERESTS') {
                  this.updateUserInterests()
                }
              })
            }}
          />
          <Button
            customClass='button button--primary'
            label={onboardingState === 'INTERESTS' ? 'Finish' : 'Next'}
            disabled={(onboardingState === 'INTERESTS' && selectedInterests.length === 0) ||
            (onboardingState === 'SOCIAL' && !userIdentities)}
            onClick={() => {
              onboardingStates.map((currentState, i) => {
                if (onboardingState === currentState) {
                  this.updateUserOnboardingState(onboardingStates[i + 1])
                  if (onboardingState === 'INTERESTS') {
                    // you may want to update the onboardingState here only if saving interests is successful
                    this.updateUserInterests()
                  }
                }
              })
            }}
          />
        </div>
      </Dialog>
    )
  }
}

export default OnboardingWizard
// disbales button on interest state:
// onboardingState === 'INTERESTS' && interestId.length === 0
