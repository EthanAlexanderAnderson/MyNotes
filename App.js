import { useEffect, useLayoutEffect, useState } from 'react';
import { TouchableOpacity, View, Text, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import MasonryList from '@react-native-seoul/masonry-list'
import { useSearchNotesQuery, useAddNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from './db';

function HomeScreen({ navigation }) {
  const { data: searchData, error, isLoading } = useSearchNotesQuery("");
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();
  const [ deleteNote ] = useDeleteNoteMutation();
  
  useEffect(() => {
    if (addNoteData != undefined) {
      console.log(addNoteData.title);
      navigation.navigate("Edit", {data: addNoteData});
    }
  }, [addNoteData]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => deleteNote(item) } style={tw`w-[98%] mb-0.5 mx-auto bg-gray-800 rounded-sm px-1`}> 
      <Text style={tw`text-white text-2xl m-3`}>{item.title}</Text>
      <Text style={tw`text-white m-3 mb-5`}>{item.content}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-900`}>
      {searchData ? 
        <MasonryList
          style={tw`p-5 pb-20`}
          data={searchData}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />  
        : <></>
      }
      <TouchableOpacity onPress={() => { addNote({title: "test title", content: "test content"}); }} style={tw`bg-blue-500 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
        <Text style={tw`text-white text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function EditScreen({ route, navigation }) {
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();
  const [ updateNote, { data: updateNoteData, error: updateNoteError }] = useUpdateNoteMutation();

  const [titleTextValue, setTitleTextValue] = useState(route.params.data.title); 
  const [contentTextValue, setContentTextValue] = useState(route.params.data.content); 

  const handleTextClick = () => {
  };

  const handleSubmitEditing = () => {
    console.log("submitting");
    console.log(titleTextValue);
    console.log(contentTextValue);
    updateNote({id: route.params.data.id, title: titleTextValue, content: contentTextValue});
  };

  useLayoutEffect(() => {
    //addNote({title: titleTextValue, content: contentTextValue});
    navigation.setOptions({ title: route.params.data.title });
  }, []);

  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-900`}>
      <TextInput style={tw`text-white`}
          value={titleTextValue}
          onChangeText={setTitleTextValue}
          onSubmitEditing={handleSubmitEditing}
          autoFocus={true}
        />
      <TextInput style={tw`text-white`}
          value={contentTextValue}
          onChangeText={setContentTextValue}
          onSubmitEditing={handleSubmitEditing}
          autoFocus={true}
        />
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  useDeviceContext(tw);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            options={{
              headerStyle: tw`bg-gray-800 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              headerStyle: tw`bg-gray-800 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="Edit"
            component={EditScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}