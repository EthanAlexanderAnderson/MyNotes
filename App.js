import { useEffect, useLayoutEffect, useState } from 'react';
import { TouchableOpacity, View, Text, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import MasonryList from '@react-native-seoul/masonry-list'
import { useSearchNotesQuery, useAddNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from './db';

var searchNotesQuery = "";
function HomeScreen({ navigation }) {
  const { data: searchData, error, isLoading } = useSearchNotesQuery(searchNotesQuery);
  const [ addNote, { data: addNoteData, error: addNoteError }] = useAddNoteMutation();
  const [ deleteNote ] = useDeleteNoteMutation();
  const [searchValue, setSearchValue] = useState(""); 
  
  useEffect(() => {
    if (addNoteData != undefined) {
      console.log(addNoteData.title);
      navigation.navigate("Edit", {data: addNoteData});
    }
  }, [addNoteData]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("Edit", {data: {id: item.id, title: item.title, content: item.content}}) } style={tw`w-[98%] mb-0.5 mx-auto bg-gray-800 rounded-sm px-1`}> 
      <Text style={tw`text-white text-2xl m-3`}>{item.title}</Text>
      <Text style={tw`text-white m-3 mb-5`}>{item.content}</Text>
    </TouchableOpacity>
  )

  const setSearchValueOverride = (text) => {
    setSearchValue(text);
    searchNotesQuery = text;
  }

  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-900`}>
        <TextInput style={tw`text-white p-1 mt-5 w-90%`}
          value={searchValue}
          onChangeText={setSearchValueOverride}
          autoFocus={false}
          placeholder='search...'
        />
      {searchData ? 
        <MasonryList
          style={tw`m-5 pb-20`}
          data={searchData}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />  
        : <></>
      }
      <TouchableOpacity onPress={() => { addNote({title: "", content: ""}); }} style={tw`bg-blue-500 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
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

  const setTitleTextValueOverride = (text) => {
    setTitleTextValue(text);
    handleEditing();
  }

  const setContentTextValueOverride = (text) => {
    setContentTextValue(text);
    handleEditing();
  }

  const handleEditing = () => {
    var pElement = document.getElementById('saved');
    const formattedDate = new Date().toLocaleDateString();
    const formattedTime = new Date().toLocaleTimeString()
    pElement.textContent = 'Note Saved - ' + formattedDate + ' ' + formattedTime;
    updateNote({id: route.params.data.id, title: titleTextValue, content: contentTextValue});
  };

  useLayoutEffect(() => {
    navigation.setOptions({ title: route.params.data.title });
  }, []);

  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-900 text-white`}>
      <TextInput style={tw`text-white p-1`}
          value={titleTextValue}
          onChangeText={setTitleTextValueOverride}
          autoFocus={true}
          placeholder='Title'
        />
      <TextInput style={tw`text-white p-1`}
          value={contentTextValue}
          onChangeText={setContentTextValueOverride}
          autoFocus={false}
          placeholder='Content'
        />
        <p id="saved">Press Enter to Save.</p>
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