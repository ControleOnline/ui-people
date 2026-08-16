const React = require('react');
const renderer = require('react-test-renderer');
const {jest} = require('@jest/globals');

jest.mock('react-native', () => ({
  View: props => React.createElement('View', props, props.children),
}));

jest.mock('react-native-vector-icons/FontAwesome', () => props => React.createElement('Icon', props));

jest.mock('@controleonline/ui-common/src/react/components/UserAvatar', () => props =>
  React.createElement('UserAvatar', props),
);

const PeopleAvatar = require('../../../react/components/PeopleAvatar').default;
const {describe, expect, it} = global;

describe('PeopleAvatar', () => {
  it('does not use gravatar by default', () => {
    let tree;
    renderer.act(() => {
      tree = renderer.create(React.createElement(PeopleAvatar, {
        people: {id: 9, name: 'Client Test', email: 'client@example.com', peopleType: 'F'},
      }));
    });

    expect(tree.root.findByType('UserAvatar').props.useGravatar).toBe(false);
  });

  it('ignores implicit people.image ids by default', () => {
    let tree;
    renderer.act(() => {
      tree = renderer.create(React.createElement(PeopleAvatar, {
        people: {id: 9, name: 'Client Test', image: 9, peopleType: 'F'},
      }));
    });

    expect(tree.root.findByType('UserAvatar').props.imageUrl).toBe('');
  });

  it('allows persisted people image only by explicit opt-in', () => {
    let tree;
    renderer.act(() => {
      tree = renderer.create(React.createElement(PeopleAvatar, {
        people: {id: 9, name: 'Client Test', image: 9, peopleType: 'F'},
        usePeopleImage: true,
      }));
    });

    expect(tree.root.findByType('UserAvatar').props.imageUrl).toContain('/files/9/download');
  });
});
