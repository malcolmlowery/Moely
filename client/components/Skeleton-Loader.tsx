import styled from 'styled-components/native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton'
import { useWindowDimensions } from 'react-native';

interface SkeletonLoaderI {
    type: 
        'post' | 
        'comment' | 
        'user-profile' | 
        'settings' | 
        'edit-profile' |
        'activity-history'
};

const SkeletonLoader = ({ type }: SkeletonLoaderI) => {
    return(
        <>
            { type === 'post' &&
                <MotiView
                    transition={{
                        type: 'timing',
                    }}
                    animate={{ backgroundColor: '#ffffff' }}
                    style={{ padding: 10, marginTop: 3 }}
                >
                    <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                        <Skeleton colorMode='light' radius="round" height={45} width={45} />
                        <View style={{ justifyContent: 'space-evenly', paddingLeft: 6 }}>
                            <Skeleton colorMode='light' height={12} width={100} radius={3} />
                            <Skeleton colorMode='light' height={12} width={200} radius={0} />
                        </View>
                    </View>
                    <Spacer />
                    <Skeleton colorMode='light' height={100} width={'100%'} radius={3} />
                    <Spacer />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                        <Skeleton colorMode='light' height={16} width={130} radius={0} />
                        <Skeleton colorMode='light' height={32} width={170} radius={12} />
                    </View>
                </MotiView>
            }
            { type === 'comment' &&
                <MotiView
                    transition={{
                        type: 'timing',
                    }}
                    animate={{ backgroundColor: '#ffffff' }}
                    style={{ padding: 10, margin: 12, marginBottom: 0, borderRadius: 12 }}
                >
                    <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                        <Skeleton colorMode='light' radius="round" height={45} width={45} />
                        <View style={{ justifyContent: 'space-evenly', paddingLeft: 6 }}>
                            <Skeleton colorMode='light' height={12} width={100} radius={3} />
                            <Skeleton colorMode='light' height={12} width={200} radius={0} />
                        </View>
                    </View>
                    <Spacer />
                    <Skeleton colorMode='light' height={50} width={'100%'} radius={3} />
                    <Spacer />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                        <Skeleton colorMode='light' height={16} width={100} radius={0} />
                        <Skeleton colorMode='light' height={32} width={150} radius={12} />
                    </View>
                </MotiView>
            }

            { type === 'user-profile' &&
                <MotiView
                    transition={{
                        type: 'timing',
                    }}
                    animate={{ backgroundColor: '#ffffff' }}
                    style={{ margin: 0 }}
                >
                    <Skeleton colorMode='light' height={170} width={'100%'} radius={0} />

                    <View style={{ 
                        backgroundColor: '#ffffff', 
                        alignItems: 'center', 
                        flexDirection: 'row', 
                        paddingVertical: 18, 
                        paddingHorizontal: 16 }}>
                        <Skeleton colorMode='light' radius="round" height={100} width={100} />
                        <View style={{ flexDirection: 'column', justifyContent: 'space-evenly', marginLeft: 16 }}>
                            <Skeleton colorMode='light' height={16} width={175} radius={3} />
                            <Spacer style={{ height: 12 }} />
                            <Skeleton colorMode='light' height={12} width={125} radius={3} />
                            <Spacer style={{ height: 12 }} />
                            <Skeleton colorMode='light' height={12} width={80} radius={3} />
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginHorizontal: 16 }}>
                        <Skeleton colorMode='light' height={25} width={80} radius={50} />
                        <MarginRight />
                        <Skeleton colorMode='light' height={25} width={110} radius={50} />
                        <MarginRight />
                        <Skeleton colorMode='light' height={25} width={70} radius={50} />
                    </View>

                    <View style={{ padding: 16 }}>
                        <Skeleton colorMode='light' height={100} width={'100%'} radius={3} />
                    </View>
                    
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                        <View style={{ flex: 1, marginLeft: 16, marginRight: 8 }}>
                            <Skeleton colorMode='light' height={32} width={'100%'} radius={12} />
                        </View>
                        <View style={{ flex: 1, marginRight: 16, marginLeft: 8 }}>
                            <Skeleton colorMode='light' height={32} width={'100%'} radius={12} />
                        </View>
                    </View>
                </MotiView>
            }

            { type === 'settings' &&
                <MotiView
                    transition={{
                        type: 'timing',
                    }}
                    animate={{ backgroundColor: '#0000000' }}
                    style={{ margin: 16 }}
                >
                    <View style={{ backgroundColor: '#ffffff', alignItems: 'center', flexDirection: 'row', height: 132, padding: 16, marginBottom: 16 }}>
                        <Skeleton colorMode='light' radius="round" height={100} width={100} />
                        <View style={{ flexDirection: 'column', justifyContent: 'space-evenly', marginLeft: 16 }}>
                            <Skeleton colorMode='light' height={16} width={175} radius={3} />
                            <Spacer style={{ height: 12 }} />
                            <Skeleton colorMode='light' height={12} width={125} radius={3} />
                            <Spacer style={{ height: 12 }} />
                            <Skeleton colorMode='light' height={12} width={80} radius={3} />
                        </View>
                    </View>

                    <View style={{ backgroundColor: '#ffffff', alignItems: 'center', flexDirection: 'column', marginBottom: 16 }}>
                        <View style={{ height: 49.3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomColor: '#ededed', borderBottomWidth: 1 }}>
                            <Skeleton colorMode='light' height={16} width={120} radius={3} />
                            <Skeleton colorMode='light' radius="round" height={30} width={30} />
                        </View>
                        <View style={{ height: 49.3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
                            <Skeleton colorMode='light' height={16} width={110} radius={3} />
                            <Skeleton colorMode='light' radius="round" height={30} width={30} />
                        </View>
                    </View>

                    <View style={{ backgroundColor: '#ffffff', alignItems: 'center', flexDirection: 'column' }}>
                        <View style={{ height: 49.3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomColor: '#ededed', borderBottomWidth: 1 }}>
                            <Skeleton colorMode='light' height={16} width={150} radius={3} />
                            <Skeleton colorMode='light' radius="round" height={30} width={30} />
                        </View>
                        <View style={{ height: 49.3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomColor: '#ededed', borderBottomWidth: 1 }}>
                            <Skeleton colorMode='light' height={16} width={120} radius={3} />
                            <Skeleton colorMode='light' radius="round" height={30} width={30} />
                        </View>
                        <View style={{ height: 49.3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
                            <Skeleton colorMode='light' height={16} width={140} radius={3} />
                            <Skeleton colorMode='light' radius="round" height={30} width={30} />
                        </View>
                    </View>
                </MotiView>
            }

            { type === 'activity-history' &&
                <MotiView
                    transition={{
                        type: 'timing',
                    }}
                    animate={{ backgroundColor: '#ffffff' }}
                    style={{ padding: 10, margin: 12, marginBottom: 0, borderRadius: 12 }}
                >
                    <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                        <Skeleton colorMode='light' radius="round" height={45} width={45} />
                        <View style={{ justifyContent: 'space-evenly', paddingLeft: 6 }}>
                            <Skeleton colorMode='light' height={12} width={100} radius={3} />
                            <Skeleton colorMode='light' height={12} width={200} radius={0} />
                        </View>
                    </View>
                    <Spacer />
                    <Skeleton colorMode='light' height={50} width={'100%'} radius={3} />
                    <Spacer />
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 6 }}>
                        <Skeleton colorMode='light' height={16} width={100} radius={0} />
                    </View>
                </MotiView>
            }
        </>
    );
};

export default SkeletonLoader;

const View = styled.View`
    border-radius: 12px;
    width: 100%;
`;

const Spacer = styled.View`
    height: 8px;
`;

const MarginRight = styled.View`
    margin-right: 10px;
`;