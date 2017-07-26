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
