##Passing down props to media modal
Some are used in many different places and are therefore defied in the very top level. i.e. `Master.js`. In order to pass these props down to the level in which you may want to use them you need to specify them in within the next level down.
If the component you are passing down to is a stateless functional component then you'll have to define it like so:
```
const MyComponent = ({currentUser}) => (
  <MediaLibraryDialog
    currentUser={currentUser}
    />
  )
```
else if the component is defined within a class you'll have to do it like this:
```
class MyComponent extends Component {
  render() {
  return (
      <MediaLibrary
        currentUser={this.props.currentUser}
    )
  }
}
```
***Still not clear on how everything has access to Master.js or how to determine the order in which you are passing down props....***

##Compose modal

Notes taken from `feature/compose-modal`, commit comment: `modal working`
Have a look a the commit [here](https://github.com/lightfulhelps/web-partners/commit/b2419eeeaf53556c336476775eb02b2ad4211a43)

Files altered:
`app/common/ComposeDialog.js`
looks like I just removed a comma. I feel like we did something more here. Ask Erika

`app/main/Master.js`
- Here we import ComposeDialog as we are putting the link in the navbar and want it to be available everywhere.
- Next we set a state to make sure the modal is closed when we load up the page. We will toggle this state on/off later.
- Now we write a function which will handle the toggling of the modal. We call it `handleComposeModal`
- We need to pass in the current state of the modal to the element in which it is contained which in this case is the header
```
//This is where we tell the containing element what the current state is. Remember `isComposeOpen=` and `handleComposeModal=` are names which we have specified at this point. It's sensible to name them the same as the state or function with which they are associated but you could call them anything.
isComposeOpen={this.state.isComposeOpen}
handleComposeModal={this.handleComposeModal}
```
- Under the header component we have the ComposeDialog component. As it is a modal it could have gone anywhere within the parent element but it seemed logical to put it next to the logic which is handling it.
- There are `props` (i think) which are specified within the ComposeDialog component which we can now assign values to. The values we assign are the values which will get from the methods we wrote earlier, so it looks like this:
```
//Here `onClose=` and `isOpen` have been defined in the ComposeDialog component which we are importing.
<ComposeDialog
  onClose={this.handleComposeModal}
  isOpen={this.state.isComposeOpen}
/>
```

`app/main/header/Header.js`
- Here we just need to assign the methods we created in Master.js to be called onClick

`app/sections/engage/compose/ComposeForm.js`
- We want the modal to close after a successful post has been made. We therefore need to assign this action to the submit button on the ComposeForm so we just add the onClose function to the list of functions the form invokes when submit is hit.
IMPORTANT: We need put this function in an `if` statement to first check whether the function itself exists. This will stop it from erroring and fucking up the whole form submission if the function cannot be found (for some reason. Ask Erika about this)
__this is the point at which we tested the modal and it almost worked. We had to put one more line in this file to resolve an error__
The error which came back on submission of the form was something like `connont read params of undefined` This is because at the point where the function was called we did not have access to `params`. To resolve this we first have to check if `params` exists so we put it in a ternary operator and set params to null if it couldn't be found:
`this.props[method](createComposePayload(postType, data, (this.props.params ? this.props.params.id : null), 'NONE'))`  

##Moving `Edit Campaign` into `Campaign Details`

I started off importing the `CampaignForm` into the `CampaignDetails` page and trying to render this component with along with the rest of the components. This errored at `componentWillMount` in the `CampaignForm`. The error read `cannot read campaignId of undefined.` The problem was that although we have access to `currentUser` within `CampaignDetails` I had not passed down params which is what the `CampaignForm` required. Everything on the route level has access to params and if you want components which are not on this level to have access then you have to pass them down. Looking in `AppRouts.js` you are able to see which components have access to these props?? (Still not entirely getting it. Ask Erika)
Anyways, `Campaign.js` is the component at the top level which is pulling everything together for the campaign, it is importing `CampaignDetails` and this is where we need to assign `params` a var so we can access it in `CampaignDetails` and subsequently pass it down to the `CampaignForm` like so:
```
<CampaignDetails
  campaign={campaign}
  handleDeleteModal={this.handleDeleteModal}
  handleComposeModal={this.handleComposeModal}
  handleRulesModal={this.handleRulesModal}
  currentResourcePermissions={currentResourcePermissions}
  currentUser={currentUser}
  params={this.props.params}
/>
```
We can then access the `params` in `CampaignDetails`. As `CampaignDetails` is a stateless functional component we have to specify `params` in the object where the `CampaignDetails` component is defined. (Here we have `campaign` to `getCampaign` as that is how it is referenced in `campaignForm`) like so:
```
const CampaignDetails = ({
  campaign,
  handleDeleteModal,
  handleComposeModal,
  handleRulesModal,
  currentResourcePermissions,
  currentUser,
  params
}) => (
  <Row>
    <CampaignForm
      getCampaign={campaign}
      params={params}
      />
//rest of the component....
```
otherwise (I think) we could just access params using `this.props.params`
Once we have access to the `params` in here we can then access `params` in Campaign form. Before we moved this component we had access to the `params` in `CampaignForm` because it was being used in `CampaignFormContiner` which is a route level component. `CampaignDetails` is not route level, but it is being used in `Campaign.js` which is, that's where we're getting the params from.
Side notes:
if you console log an object using concatination: console.log(`obj: ${my.object}`) then the object will be coerced into a string. you need to separate objects and strings with a comma like so: console.log('obj: ', my.obj)
Also this is syntax for deconstructing an obj:
`const { params: { campaignId }, getCampaign } = this.props`
it's worth doing some research on it, it's tricky stuff but at least you know what to Google now.

Because the we are accessing the campain obj at a lower level here we just removed the `campainById` level on the queries.
Its also worth mentioning that Lowdash wants two methods here, the first is where it's looking and the second (which has to be a string) is what it is looking for (I think)
So this is what the `componentWillMount` function looked like before and after:

Before:
```
componentWillMount () {
    const { params: { campaignId }, getCampaign } = this.props
    if (_.has(getCampaign, 'campaignById.id') && getCampaign.campaignById.id === campaignId) {
      this.props.initialize({
        title: getCampaign.campaignById.name,
        description: getCampaign.campaignById.description,
        image: getCampaign.campaignById.coverImageUrl
      })
    }
  }
```

After:
```
componentWillMount () {
    console.log('get campaign: ', this.props.getCampaign)
    console.log('get params: ', this.props.params)

    const { params: { campaignId }, getCampaign } = this.props
    if (_.has(getCampaign, 'id') && getCampaign.id === campaignId) {
      this.props.initialize({
        title: getCampaign.name,
        description: getCampaign.description,
        image: getCampaign.coverImageUrl
      })
    }
  }
```

At this point the form does appear on the screen but you need to sort out the functionality.

We add this query to the `CampaignContainer`
```

 +    graphql(updateCampaign, {
 +      name: 'updateCampaign',
 +      skip: (props) => !props.params.campaignId
 +    })(Component)
 ```

 add updateCampaign to the params in `CampaignDetails`. updateCampaign is the graphql mutation which adds the functionality which updates the form. Before we moved the CampaignForm component we had access to it through the CampaignFormContainer but as the CampaignForm is not hooked up to the CampaignFormContainer we have to then put the graphql updateCampaign mutation at the next highest level where the CampaignForm can access it. In our case this means moving it to CampaignContainer.

 CampaignDetails is used in Campaign.js, this is the point at which we have access to props at the route level (yeah, you're still not really  getting this are you?!) So we have specified props here like so:

 ```
 <CampaignDetails
            campaign={campaign}
            handleDeleteModal={this.handleDeleteModal}
            handleComposeModal={this.handleComposeModal}
            handleRulesModal={this.handleRulesModal}
            currentResourcePermissions={currentResourcePermissions}
            currentUser={currentUser}
            params={this.props.params}
            updateCampaign={this.props.updateCampaign}
            addNotification={this.props.addNotification}
          />
```
Then pass it down to campaign form like so:
```
<CampaignForm
      getCampaign={campaign}
      params={params}
      updateCampaign={updateCampaign}
      addNotification={addNotification}
      />
```

As you can see we have also specified addNotification as a prop. This gives us a success or error message when we add or update a campaign. Once we have access to the addNotification function we can put it in the handleSubmit function in CampaignForm. We can also look for a campaignId. If there is one it means that the user is updating a campaign and if not it means they are creating one. We'll show the success message only if a campaign is being updated. Like so:

```
//a bunch of other code
.then(({ data }) => {
  campaignId ? this.props.addNotification('success', 'Campaign updated') : this.context.router.push(`/campaigns/${campaignId || data.createCampaign.campaign.id}`)
})
.catch(() => {
  this.props.addNotification('error', 'Something went wrong, please try again')
})
```
